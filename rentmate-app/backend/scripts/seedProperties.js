import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Property from '../models/property.model.js';
import User from '../models/userModel.js';

const mockProperties = (verifiedOwnerId, unverifiedOwnerId) => [
  {
    ownerId: verifiedOwnerId,
    title: 'Luxury Single PG in Indiranagar',
    description: 'A premium single room PG in the heart of Indiranagar. Extremely clean, fully furnished, close to metro station. Includes delicious food, gym membership, and swimming pool access.',
    price: 15000,
    type: 'PG',
    sharingType: 'single',
    genderCategory: 'unisex',
    amenities: ['Wifi', 'AC', 'Gym', 'Laundry', 'Power Backup', 'Food'],
    location: {
      type: 'Point',
      coordinates: [77.6413, 12.9719] // Indiranagar, Bangalore
    },
    address: {
      street: '12th Main Road, Indiranagar',
      locality: 'Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560038'
    },
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    isFeatured: true,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 4.8,
    ratingCount: 15,
    viewsCount: 450,
    wishlistCount: 88
  },
  {
    ownerId: verifiedOwnerId,
    title: 'Cozy Double Sharing Hostel Koramangala',
    description: 'Budget-friendly double sharing hostel for boys in Koramangala. Includes high speed wifi, laundry service, and 24/7 security. Clean washrooms and study rooms available.',
    price: 8500,
    type: 'Hostel',
    sharingType: 'double',
    genderCategory: 'boys',
    amenities: ['Wifi', 'Laundry', 'Power Backup', 'Security'],
    location: {
      type: 'Point',
      coordinates: [77.6245, 12.9352] // Koramangala, Bangalore
    },
    address: {
      street: '80 Feet Road, Koramangala 4th Block',
      locality: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560034'
    },
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
    isFeatured: false,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 4.2,
    ratingCount: 8,
    viewsCount: 210,
    wishlistCount: 24
  },
  {
    ownerId: verifiedOwnerId,
    title: 'Modern 2BHK Flat in HSR Layout',
    description: 'Fully furnished 2BHK flat available for rent in HSR Layout. Ideal for young professionals or students. Gated society with parking, lift, power backup, and CCTV security.',
    price: 32000,
    type: 'Flat',
    sharingType: 'other',
    genderCategory: 'unisex',
    amenities: ['Wifi', 'Power Backup', 'Security', 'Parking'],
    location: {
      type: 'Point',
      coordinates: [77.6309, 12.9100] // HSR Layout, Bangalore
    },
    address: {
      street: '19th Main Road, HSR Layout Sector 3',
      locality: 'HSR Layout',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560102'
    },
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    isFeatured: true,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 4.5,
    ratingCount: 12,
    viewsCount: 380,
    wishlistCount: 65
  },
  {
    ownerId: unverifiedOwnerId,
    title: 'Cheap Triple Sharing Girls PG - HSR',
    description: 'Affordable triple sharing girls PG in HSR Layout. Safe and secure neighborhood. Near major institutes and IT parks. Clean food and purified water included.',
    price: 6000,
    type: 'PG',
    sharingType: 'triple',
    genderCategory: 'girls',
    amenities: ['Wifi', 'Laundry', 'Security', 'Food'],
    location: {
      type: 'Point',
      coordinates: [77.6400, 12.9150] // Sector 2 HSR Layout, Bangalore
    },
    address: {
      street: '24th Main Road, Sector 2',
      locality: 'HSR Layout',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560102'
    },
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    isFeatured: false,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 3.5,
    ratingCount: 4,
    viewsCount: 95,
    wishlistCount: 5
  },
  {
    ownerId: verifiedOwnerId,
    title: 'Spacious PG Room for Boys in Andheri West',
    description: 'Double and single rooms available for boys in Andheri West, Mumbai. Located close to the metro station and markets. Daily housekeeping and laundry included.',
    price: 18000,
    type: 'PG',
    sharingType: 'double',
    genderCategory: 'boys',
    amenities: ['Wifi', 'AC', 'Laundry', 'Power Backup'],
    location: {
      type: 'Point',
      coordinates: [72.8284, 19.1176] // Andheri West, Mumbai
    },
    address: {
      street: 'Link Road, Near Versova Metro',
      locality: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400053'
    },
    images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'],
    isFeatured: true,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 4.7,
    ratingCount: 22,
    viewsCount: 520,
    wishlistCount: 110
  },
  {
    ownerId: unverifiedOwnerId,
    title: 'Premium Flatmate Room in Bandra',
    description: 'Beautiful bedroom available in a 3BHK flat in Bandra West. Shared kitchen, living room, and spacious balcony. Amazing city views, premium wooden flooring, and 24/7 security.',
    price: 45000,
    type: 'Flat',
    sharingType: 'single',
    genderCategory: 'unisex',
    amenities: ['Wifi', 'AC', 'Gym', 'Security', 'Parking'],
    location: {
      type: 'Point',
      coordinates: [72.8402, 19.0600] // Bandra West, Mumbai
    },
    address: {
      street: 'Carter Road',
      locality: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400050'
    },
    images: ['https://images.unsplash.com/photo-1502672090373-c4ae977934b8?auto=format&fit=crop&w=800&q=80'],
    isFeatured: true,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 4.9,
    ratingCount: 30,
    viewsCount: 890,
    wishlistCount: 230
  },
  {
    ownerId: verifiedOwnerId,
    title: 'Student Girls Hostel Viman Nagar',
    description: 'Secure student hostel for girls in Viman Nagar, Pune. Walking distance from Symbiosis Campus. Includes nutritious food, wifi, library, study areas, and housekeeping.',
    price: 11000,
    type: 'Hostel',
    sharingType: 'triple',
    genderCategory: 'girls',
    amenities: ['Wifi', 'Laundry', 'Security', 'Food', 'Power Backup'],
    location: {
      type: 'Point',
      coordinates: [73.9143, 18.5630] // Viman Nagar, Pune
    },
    address: {
      street: 'Symbiosis Road, Clover Park',
      locality: 'Viman Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411014'
    },
    images: ['https://images.unsplash.com/photo-1623625409419-f2038753239a?auto=format&fit=crop&w=800&q=80'],
    isFeatured: false,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 4.1,
    ratingCount: 9,
    viewsCount: 140,
    wishlistCount: 18
  },
  {
    ownerId: verifiedOwnerId,
    title: 'Hostel PG under Maintenance Test Room',
    description: 'This is a test property in Bangalore that is currently occupied and under maintenance to ensure filters exclude it.',
    price: 10000,
    type: 'PG',
    sharingType: 'double',
    genderCategory: 'unisex',
    amenities: ['Wifi'],
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // Bangalore
    },
    address: {
      street: 'Test Street',
      locality: 'Central Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001'
    },
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    isFeatured: false,
    verificationStatus: 'approved',
    availabilityStatus: 'maintenance',
    ratingAverage: 3.0,
    ratingCount: 1,
    viewsCount: 10,
    wishlistCount: 0
  },
  {
    ownerId: verifiedOwnerId,
    title: 'Pending Verification Test Property',
    description: 'This property has a pending verification status and should be excluded from search queries.',
    price: 12000,
    type: 'Flat',
    sharingType: 'single',
    genderCategory: 'unisex',
    amenities: ['Wifi'],
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // Bangalore
    },
    address: {
      street: 'Unverified Street',
      locality: 'Central Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001'
    },
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    isFeatured: false,
    verificationStatus: 'pending',
    availabilityStatus: 'available',
    ratingAverage: 0.0,
    ratingCount: 0,
    viewsCount: 5,
    wishlistCount: 0
  },
  {
    ownerId: verifiedOwnerId,
    title: 'Affordable Student Room Delhi',
    description: 'A cozy budget room located near North Campus DU. Ideal for students. Features high speed wifi, laundry facilities, and a common kitchen.',
    price: 5000,
    type: 'Hostel',
    sharingType: 'double',
    genderCategory: 'unisex',
    amenities: ['Wifi', 'Laundry', 'Power Backup'],
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Delhi
    },
    address: {
      street: 'Kamla Nagar, near DU North Campus',
      locality: 'Kamla Nagar',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110007'
    },
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    isFeatured: true,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 4.0,
    ratingCount: 5,
    viewsCount: 120,
    wishlistCount: 15
  },
  {
    ownerId: verifiedOwnerId,
    title: 'Girls Hostel Near MMMUT Gorakhpur',
    description: 'Extremely secure hostel accommodation for girls near MMMUT, Gorakhpur. Includes home-style food, study rooms, 24/7 power backup, and CCTV security.',
    price: 4200,
    type: 'Hostel',
    sharingType: 'triple',
    genderCategory: 'girls',
    amenities: ['Wifi', 'Laundry', 'Power Backup', 'Food'],
    location: {
      type: 'Point',
      coordinates: [83.4331, 26.7588] // Gorakhpur
    },
    address: {
      street: 'Deoria Road, Near MMMUT',
      locality: 'MMMUT Area',
      city: 'Gorakhpur',
      state: 'Uttar Pradesh',
      zipCode: '273010'
    },
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
    isFeatured: false,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 4.5,
    ratingCount: 10,
    viewsCount: 180,
    wishlistCount: 22
  },
  {
    ownerId: verifiedOwnerId,
    title: 'Single Student Room Lucknow',
    description: 'Fully furnished single occupancy room in Hazratganj, Lucknow. Modern amenities, air conditioned, cleaning service, and walking distance from main markets.',
    price: 7800,
    type: 'PG',
    sharingType: 'single',
    genderCategory: 'boys',
    amenities: ['Wifi', 'AC', 'Laundry'],
    location: {
      type: 'Point',
      coordinates: [80.9462, 26.8467] // Lucknow
    },
    address: {
      street: 'Hazratganj Road',
      locality: 'Hazratganj',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      zipCode: '226001'
    },
    images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'],
    isFeatured: true,
    verificationStatus: 'approved',
    availabilityStatus: 'available',
    ratingAverage: 4.3,
    ratingCount: 7,
    viewsCount: 150,
    wishlistCount: 30
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Connected to Database. Starting seed...');

    // 1. Create or retrieve mock owners
    let verifiedOwner = await User.findOne({ email: 'verifiedowner@rentmate.com' });
    if (!verifiedOwner) {
      verifiedOwner = await User.create({
        name: 'John Verified Owner',
        email: 'verifiedowner@rentmate.com',
        password: 'password123',
        phoneNumber: '+1234567890',
        role: 'owner',
        isVerified: true
      });
      console.log('Created verified owner user.');
    } else {
      // Ensure it is set to verified: true
      verifiedOwner.isVerified = true;
      await verifiedOwner.save();
    }

    let unverifiedOwner = await User.findOne({ email: 'unverifiedowner@rentmate.com' });
    if (!unverifiedOwner) {
      unverifiedOwner = await User.create({
        name: 'Jane Unverified Owner',
        email: 'unverifiedowner@rentmate.com',
        password: 'password123',
        phoneNumber: '+1987654321',
        role: 'owner',
        isVerified: false
      });
      console.log('Created unverified owner user.');
    } else {
      // Ensure it is set to verified: false
      unverifiedOwner.isVerified = false;
      await unverifiedOwner.save();
    }

    // 2. Clear existing properties
    const deleteRes = await mongoose.connection.db.collection('properties').deleteMany({});
    console.log(`Deleted ${deleteRes.deletedCount} existing properties.`);

    // 3. Insert mock properties
    const propertiesToInsert = mockProperties(verifiedOwner._id, unverifiedOwner._id);
    const createdProperties = await Property.insertMany(propertiesToInsert);
    console.log(`Successfully seeded ${createdProperties.length} properties.`);

    // Log the properties and their details
    createdProperties.forEach(p => {
      console.log(`- [${p.type}] ${p.title} (${p.address.city}, Price: ₹${p.price}, Rating: ${p.ratingAverage}, Verified Owner: ${p.ownerId.toString() === verifiedOwner._id.toString()})`);
    });

    console.log('Database seeding complete. Closing database connection.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
