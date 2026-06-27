import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [
        function () {
          // Password is only mandatory if Google login (googleId) is not present
          return !this.googleId;
        },
        'Password is required when Google login is not used',
      ],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Exclude password from query results by default for security
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number'],
    },
    avatar: {
      publicId: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: 'https://res.cloudinary.com/rentmate/image/upload/v1/default-avatar.png',
      },
    },
    role: {
      type: String,
      enum: {
        values: ['tenant', 'owner', 'admin'],
        message: 'Role must be tenant, owner, or admin',
      },
      default: 'tenant',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows nulls to coexist while enforcing uniqueness for string keys
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpire: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordTokenExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- INDEXES ---
// (Indexes are defined inline on fields)

// --- VIRTUALS ---
// Virtual property to evaluate account activation status
userSchema.virtual('isActive').get(function () {
  return !this.isBlocked && !this.isDeleted;
});

// --- MIDDLEWARES ---
// Query Middleware: Exclude soft-deleted users automatically from standard operations
userSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

// Pre-save Middleware: Encrypt password if new or modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Automatically track password modification dates (excluding new document creations)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Offset by 1s to prevent JWT race conditions
  }
});

// --- SCHEMA METHODS ---
// Compare plain password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate standard claims object for access tokens
userSchema.methods.generateAccessTokenPayload = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isVerified: this.isVerified,
  };
};

// Evaluate if credentials changed after token timestamp issuance
userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
export default User;
