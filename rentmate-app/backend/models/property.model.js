import mongoose from 'mongoose';
import slugify from 'slugify';

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required.'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Property title is required.'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters.'],
      maxlength: [100, 'Title cannot exceed 100 characters.'],
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Property description is required.'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters.'],
      maxlength: [2000, 'Description cannot exceed 2000 characters.'],
    },
    price: {
      type: Number,
      required: [true, 'Monthly rent price is required.'],
      min: [0, 'Price cannot be negative.'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Property type is required.'],
      enum: {
        values: ['PG', 'Hostel', 'Flat'],
        message: 'Type must be PG, Hostel, or Flat.',
      },
      index: true,
    },
    sharingType: {
      type: String,
      required: [true, 'Sharing configuration type is required.'],
      enum: {
        values: ['single', 'double', 'triple', 'quad', 'other'],
        message: 'Sharing type must be single, double, triple, quad, or other.',
      },
      index: true,
    },
    genderCategory: {
      type: String,
      required: [true, 'Gender category is required.'],
      enum: {
        values: ['boys', 'girls', 'unisex'],
        message: 'Gender category must be boys, girls, or unisex.',
      },
      index: true,
    },
    amenities: {
      type: [String],
      required: [true, 'Amenities list is required.'],
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Geospatial coordinates [longitude, latitude] are required.'],
      },
    },
    address: {
      street: { type: String, required: [true, 'Street address is required.'] },
      locality: { type: String, required: [true, 'Locality is required.'], index: true },
      city: { type: String, required: [true, 'City is required.'], index: true },
      state: { type: String, required: [true, 'State is required.'] },
      zipCode: { type: String, required: [true, 'Zip code is required.'] },
    },
    images: {
      type: [String],
      validate: {
        validator: (array) => array && array.length > 0,
        message: 'At least one image URL is required.',
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available',
      index: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0.'],
      max: [5, 'Rating cannot exceed 5.'],
      set: (val) => Math.round(val * 10) / 10,
      index: true,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },
    wishlistCount: {
      type: Number,
      default: 0,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- GEOSPATIAL INDEX ---
propertySchema.index({ location: '2dsphere' });

// --- COMPOUND INDEXES ---
propertySchema.index({ verificationStatus: 1, availabilityStatus: 1, price: 1, genderCategory: 1 });
propertySchema.index({ 'address.city': 1, 'address.locality': 1 });
propertySchema.index({ createdAt: -1 });

// --- TEXT INDEX ---
propertySchema.index({
  title: 'text',
  description: 'text',
  'address.locality': 'text',
  'address.city': 'text',
});

// --- QUERY MIDDLEWARE ---
// Automatically exclude soft-deleted properties from queries
propertySchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

// Helper to generate a unique slug pre-validation
propertySchema.pre('validate', function () {
  if (this.title && (this.isModified('title') || !this.slug)) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
});

// Pre-save slug fallback
propertySchema.pre('save', function () {
  if (this.title && (this.isModified('title') || !this.slug)) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
});

// Automatically regenerate unique slug when property title is updated
propertySchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (!update) return;

  let title;
  if (update.title) {
    title = update.title;
  } else if (update.$set && update.$set.title) {
    title = update.$set.title;
  }

  if (title) {
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
    if (update.title) {
      update.slug = slug;
    } else {
      if (!update.$set) update.$set = {};
      update.$set.slug = slug;
    }
  }
});

const Property = mongoose.model('Property', propertySchema);
export default Property;
