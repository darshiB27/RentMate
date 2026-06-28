import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user identifier (userId) is required.'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required.'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required.'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['inquiry', 'property', 'review', 'verification', 'system'],
      required: [true, 'Notification type is required.'],
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      // Refers to inquiryId, propertyId, reviewId, etc. depending on notification type.
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TTL Index: Automatically purge notification logs after 30 days to limit DB size.
// 30 days = 30 * 24 * 60 * 60 = 2,592,000 seconds
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Compound index for optimizing paginated fetches for a user
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
