/**
 * Migration Script: Fix properties with invalid ownerId values.
 * 
 * Some properties were created with placeholder strings like "PUT_VALID_OWNER_ID"
 * instead of valid MongoDB ObjectIds. This script finds those documents and
 * reassigns them to the first available owner user, or a specified user ID.
 * 
 * Usage:
 *   npx @dotenvx/dotenvx run -- node scripts/fixOwnerIds.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Try loading env (dotenvx handles this externally, but fallback)
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixOwnerIds() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;

    // Find all properties with invalid (non-ObjectId) ownerId
    const allProperties = await db.collection('properties').find({}).toArray();
    
    const badProperties = allProperties.filter(p => {
      const oid = p.ownerId;
      if (!oid) return true;
      // If it's already an ObjectId, it's fine
      if (typeof oid === 'object' && oid.constructor.name === 'ObjectId') return false;
      // If it's a string, check if it's a valid 24-char hex
      if (typeof oid === 'string' && /^[0-9a-fA-F]{24}$/.test(oid)) return false;
      return true;
    });

    console.log(`Found ${badProperties.length} properties with invalid ownerId:`);
    for (const p of badProperties) {
      console.log(`  - ${p._id} (title: "${p.title}", ownerId: "${p.ownerId}")`);
    }

    if (badProperties.length === 0) {
      console.log('No properties need fixing. Exiting.');
      await mongoose.disconnect();
      return;
    }

    // Find a valid owner user to reassign these properties to
    const ownerUser = await db.collection('users').findOne({ role: 'owner' });
    if (!ownerUser) {
      console.error('No owner user found in the database. Cannot reassign properties.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`\nReassigning to owner: ${ownerUser._id} (${ownerUser.name || ownerUser.email})`);

    for (const p of badProperties) {
      await db.collection('properties').updateOne(
        { _id: p._id },
        { $set: { ownerId: ownerUser._id } }
      );
      console.log(`  ✓ Fixed property ${p._id} ("${p.title}")`);
    }

    console.log(`\nDone. Fixed ${badProperties.length} properties.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

fixOwnerIds();
