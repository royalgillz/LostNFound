/**
 * Seed script — inserts a demo user and sample listings into MongoDB.
 * Run once from the LostNFound/ directory:
 *   node api/seed.js
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Listing from './models/listing.model.js';

dotenv.config();

const DEMO_USER = {
  username: 'demo_user',
  email:    'demo@thapar.edu',
  password: 'Demo@1234',
};

const SAMPLE_LISTINGS = [
  {
    name:        'Black JanSport Backpack',
    description: 'Medium-sized black JanSport backpack with a red zipper pull. Has a water bottle pocket on the side and some stickers on the front. Left behind near the library entrance.',
    address:     'Main Library, Ground Floor',
    type:        'lost',
    clothing:    false,
    college:     false,
    gadgets:     false,
    imageUrls:   [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    ],
  },
  {
    name:        'iPhone 13 (Blue)',
    description: 'Blue iPhone 13 with a cracked screen protector. Has a grey silicone case. Found on one of the benches outside Block C. Screen was on when found.',
    address:     'Block C, Outdoor Seating Area',
    type:        'found',
    clothing:    false,
    college:     false,
    gadgets:     true,
    imageUrls:   [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&q=80',
    ],
  },
  {
    name:        'Mechanical Pencil Set',
    description: 'A set of 3 Staedtler mechanical pencils (0.5mm) in a clear plastic case along with an eraser. Found on a desk in the reading room. Label on the case says "Arjun".',
    address:     'Reading Room, 2nd Floor Library',
    type:        'found',
    clothing:    false,
    college:     true,
    gadgets:     false,
    imageUrls:   [
      'https://images.unsplash.com/photo-1510166089176-d18db6b93ef1?w=600&q=80',
    ],
  },
  {
    name:        'Navy Blue Hoodie',
    description: 'Navy blue unisex hoodie, size L. Has a small Thapar University logo on the chest. Lost somewhere around the cafeteria or the hostel common room.',
    address:     'Cafeteria / Hostel Common Room',
    type:        'lost',
    clothing:    true,
    college:     false,
    gadgets:     false,
    imageUrls:   [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
    ],
  },
  {
    name:        'Sony WH-1000XM4 Headphones',
    description: 'Black Sony noise-cancelling headphones in a black zippered case. Found in the computer lab after the last session. Please contact if these are yours.',
    address:     'Computer Lab, Block A',
    type:        'found',
    clothing:    false,
    college:     false,
    gadgets:     true,
    imageUrls:   [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    ],
  },
  {
    name:        'Student ID Card',
    description: 'Thapar University student ID card. Name on card: Priya Sharma, Branch: ECE. Found near the main gate security post.',
    address:     'Main Gate Security Post',
    type:        'found',
    clothing:    false,
    college:     true,
    gadgets:     false,
    imageUrls:   [
      'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&q=80',
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB');

    // Upsert demo user
    let user = await User.findOne({ email: DEMO_USER.email });
    if (user) {
      console.log(`Demo user already exists (${user._id}), skipping user creation.`);
    } else {
      const hashed = bcryptjs.hashSync(DEMO_USER.password, 10);
      user = await User.create({ ...DEMO_USER, password: hashed });
      console.log(`Demo user created: ${user._id}`);
    }

    // Insert listings
    const docs = SAMPLE_LISTINGS.map((l) => ({ ...l, userRef: user._id.toString() }));
    const inserted = await Listing.insertMany(docs);
    console.log(`Inserted ${inserted.length} listings.`);

    inserted.forEach((l) => console.log(`  [${l.type.toUpperCase()}] ${l.name}`));

    console.log('\nDone. Demo login: demo@thapar.edu / Demo@1234');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
