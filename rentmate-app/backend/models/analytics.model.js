import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property listing reference is required.'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required.'],
    },
    date: {
      type: Date,
      required: [true, 'Date log is required.'],
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    inquiriesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    wishlistCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique compound index: One analytics record per property per day
analyticsSchema.index({ propertyId: 1, date: 1 }, { unique: true });

// Optimize query searches for owner and dates
analyticsSchema.index({ ownerId: 1, date: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
