import mongoose from 'mongoose';

const propertyViewSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property reference is required.'],
      index: true,
    },
    viewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    ipHash: {
      type: String,
      required: [true, 'Anonymized viewer IP hash is required.'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log creation time
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TTL Index: Purge raw property views after 90 days
// 90 days = 90 * 24 * 60 * 60 = 7,776,000 seconds
propertyViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Compound index to quickly scan daily views of a property and check for duplicate 24h hits
propertyViewSchema.index({ propertyId: 1, ipHash: 1, createdAt: -1 });

const PropertyView = mongoose.model('PropertyView', propertyViewSchema);
export default PropertyView;
