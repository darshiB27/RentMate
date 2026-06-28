import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant identifier (tenantId) is required'],
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner identifier (ownerId) is required'],
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property identifier (propertyId) is required'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Inquiry message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
    },
    preferredVisitDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'viewed', 'contacted', 'visit_scheduled', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Status notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Optimize searches filtering active inquiries by status
inquirySchema.index({ tenantId: 1, propertyId: 1, status: 1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
