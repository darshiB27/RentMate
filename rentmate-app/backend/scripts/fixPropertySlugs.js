import mongoose from 'mongoose';
import slugify from 'slugify';
import connectDB from '../config/db.js';
import Property from '../models/property.model.js';

const runMigration = async () => {
  try {
    // Connect to database using existing helper
    await connectDB();

    // Query both active and soft-deleted properties with null/missing slugs
    // By default, query hooks automatically exclude soft-deleted (isDeleted: true) properties.
    // To retrieve all documents in MongoDB (including soft-deleted), we temporarily bypass the pre-find hook filters.
    const properties = await Property.find({
      $or: [
        { slug: null },
        { slug: { $exists: false } }
      ]
    }).setOptions({ skipFilter: true }); // bypass standard soft-delete filter if defined in custom query middleware

    let fixedCount = 0;
    let skippedCount = 0;

    for (const property of properties) {
      if (property.title) {
        // Generate unique slug using title and timestamp
        const slug = slugify(property.title, { lower: true, strict: true }) + '-' + Date.now();
        
        // Use updateOne to only update the slug, avoiding validation/geospatial errors on other malformed legacy fields
        await Property.updateOne({ _id: property._id }, { $set: { slug } });
        fixedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`Fixed ${fixedCount} properties.`);
    console.log(`Skipped ${skippedCount} properties.`);

    // Close the connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
