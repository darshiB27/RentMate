import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
  findOneUser,
  createUser,
  updateUser,
  updateLastLogin,
} from '../repositories/auth.repository.js';
import env from './env.js';
import logger from './logger.js';
import ApiError from '../utils/ApiError.js';

/**
 * Google OAuth 2.0 Strategy — Redirect Flow.
 *
 * Triggered on the /google/callback route after Google redirects back.
 * Execution order:
 *   1. Extract profile fields from Google.
 *   2. Search for an existing user by googleId OR email.
 *   3a. If found: link googleId if missing, assert account health (not blocked/deleted),
 *       mark isVerified=true, update lastLogin.
 *   3b. If not found: create a new verified tenant account with googleId.
 *   4. Pass the full Mongoose document to done() — it becomes req.user in the route handler.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true, // We need req to read state and retrieve chosen role
      scope: ['profile', 'email'],
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // --- 1. Extract profile fields ---
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || 'Google User';
        const avatar = profile.photos?.[0]?.value || '';
        const googleId = profile.id;

        if (!email) {
          logger.error('[Passport] Google profile did not return an email address.');
          return done(
            new ApiError(400, 'Google did not share an email address. Please ensure your Google account has a verified email.'),
            null
          );
        }

        // --- 2. Find by googleId first, then fall back to email ---
        let user = await findOneUser(
          { $or: [{ googleId }, { email }] },
          { lean: false } // Need full document for method calls (generateAccessTokenPayload)
        );

        // --- 3a. Existing user ---
        if (user) {
          if (user.isDeleted) {
            logger.warn(`[Passport] Login attempt for deleted account: ${email}`);
            return done(new ApiError(401, 'This account has been removed from the platform.'), null);
          }
          if (user.isBlocked) {
            logger.warn(`[Passport] Login attempt for blocked account: ${email}`);
            return done(new ApiError(403, 'Your account has been suspended. Please contact support.'), null);
          }

          // Link googleId if this is an existing email-only account signing in with Google for the first time
          if (!user.googleId) {
            logger.info(`[Passport] Linking Google ID to existing account: ${email}`);
            user = await updateUser(
              user._id,
              {
                $set: {
                  googleId,
                  isVerified: true, // Retroactively verify email-only accounts via Google
                  'avatar.url': user.avatar?.url || avatar, // Preserve existing avatar
                },
              },
              { newDoc: true, lean: false }
            );
          }

          // Ensure Google-linked accounts are always marked as verified
          if (!user.isVerified) {
            user = await updateUser(
              user._id,
              { $set: { isVerified: true } },
              { newDoc: true, lean: false }
            );
          }

          // Update lastLogin timestamp (fire-and-forget; non-blocking)
          updateLastLogin(user._id).catch((err) =>
            logger.error(`[Passport] Failed to update lastLogin for ${user._id}: ${err.message}`)
          );

          logger.info(`[Passport] Google authentication succeeded (existing user): ${email}`);
          return done(null, user);
        }

        // --- 3b. New user — create a verified tenant/owner account ---
        logger.info(`[Passport] Creating new account via Google OAuth: ${email}`);
        
        let role = 'tenant';
        const stateStr = req.query?.state;
        if (stateStr) {
          try {
            const stateObj = JSON.parse(stateStr);
            if (stateObj?.role === 'owner') {
              role = 'owner';
            }
          } catch (err) {
            if (stateStr === 'owner') {
              role = 'owner';
            }
          }
        } else if (req.query?.role === 'owner') {
          role = 'owner';
        }

        const newUser = await createUser({
          name,
          email,
          googleId,
          avatar: { url: avatar },
          role,                // Save with selected role
          isVerified: true,    // Google-managed emails are pre-verified
        });

        logger.info(`[Passport] New Google account created: ${email} (id: ${newUser._id})`);
        return done(null, newUser);
      } catch (error) {
        logger.error(`[Passport] Error in Google Strategy callback: ${error.message}`);
        return done(error, null);
      }
    }
  )
);

// ---------------------------------------------------------------------------
// Serialization — stateless JWT architecture, no session storage needed.
// These are required by Passport even in a stateless setup.
// ---------------------------------------------------------------------------
passport.serializeUser((user, done) => {
  done(null, user._id ? user._id.toString() : user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { findUserById } = await import('../repositories/auth.repository.js');
    const user = await findUserById(id, { lean: false });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
