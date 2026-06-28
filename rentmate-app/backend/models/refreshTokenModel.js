import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true, // Speeds up multi-device checks and global logouts
    },
    token: {
      type: String,
      required: [true, 'Refresh token value is required'],
      unique: true,
    },
    deviceInfo: {
      browser: {
        type: String,
        default: 'Unknown',
      },
      os: {
        type: String,
        default: 'Unknown',
      },
      device: {
        type: String,
        default: 'Unknown',
      },
      location: {
        type: String,
        default: 'Unknown',
      },
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration timestamp is required'],
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// --- INDEXES ---
// TTL Index: Automatically deletes documents from MongoDB when the expiresAt timestamp is reached
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// --- STATIC METHODS ---
// Revokes all active refresh token documents for a specific user (Logout All Devices)
refreshTokenSchema.statics.revokeAllSessions = async function (userId) {
  return await this.updateMany(
    { userId, isRevoked: false },
    { $set: { isRevoked: true } }
  );
};

// --- INSTANCE METHODS ---
// Revokes the individual refresh token session
refreshTokenSchema.methods.revoke = async function () {
  this.isRevoked = true;
  return await this.save();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
