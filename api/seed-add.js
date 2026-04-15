/**
 * Additive seed — appends new listings to existing demo users.
 * Does NOT delete or modify any existing data.
 * Run from LostNFound/ directory:
 *   node api/seed-add.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Listing from './models/listing.model.js';

dotenv.config();

const UNS = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

// Demo user emails (must already exist in DB)
const DEMO_EMAILS = [
  'rahul@thapar.edu',   // index 0
  'priya@thapar.edu',   // index 1
  'aman@thapar.edu',    // index 2
  'neha@thapar.edu',    // index 3
];

const NEW_LISTINGS = [
  {
    userIndex: 0,
    name: 'Engineering Mathematics Textbook',
    description:
      'Higher Engineering Mathematics by B.S. Grewal (44th edition). Has "Rahul — ME 2nd yr" written on the first page in blue ink. Found on a bench outside the library after morning classes.',
    address: 'Central Library, Outdoor Seating',
    type: 'found',
    books: true,
    imageUrls: [UNS('photo-1544716278-ca5e3f4abd8c')],
  },
  {
    userIndex: 1,
    name: 'Spiral Notebook — Data Structures Notes',
    description:
      'A5 spiral-bound notebook, red cover, about 60 pages of handwritten Data Structures notes. Lost somewhere between Block C and the cafeteria. Has my name "Priya" on the back cover.',
    address: 'Block C to Cafeteria Route',
    type: 'lost',
    books: true,
    imageUrls: [UNS('photo-1517842645767-c639042777db')],
  },
  {
    userIndex: 2,
    name: 'Ray-Ban Aviator Sunglasses',
    description:
      'Gold-frame Ray-Ban Aviator sunglasses with classic green lenses. Found near the sports complex benches after the evening session. Kept safely, please contact to collect.',
    address: 'Sports Complex, Outdoor Benches',
    type: 'found',
    accessories: true,
    imageUrls: [UNS('photo-1511499767150-a48a237f0083')],
  },
  {
    userIndex: 3,
    name: 'Black Folding Umbrella',
    description:
      'Compact black folding umbrella with a wrist strap. Left on a cafeteria chair during the afternoon rush. No markings, but the handle has a small rubber grip worn off on one side.',
    address: 'Cafeteria, Main Food Court',
    type: 'lost',
    other: true,
    imageUrls: [UNS('photo-1558618666-fcd25c85cd64')],
  },
  {
    userIndex: 0,
    name: 'SanDisk USB Flash Drive 64 GB',
    description:
      'Red SanDisk Cruzer Blade 64 GB USB drive. Contains important project files — "VLSI_Project_Final" folder visible on it. Found plugged into a desktop in Lab 2, Computer Centre.',
    address: 'Computer Centre, Lab 2',
    type: 'found',
    gadgets: true,
    college: true,
    imageUrls: [UNS('photo-1558494949-ef010cbdcc31')],
  },
  {
    userIndex: 1,
    name: 'White Lab Coat (Size L)',
    description:
      'White cotton lab coat, size L. Has a few blue ink stains on the left sleeve and the initials "P.S." stitched on the chest pocket. Lost near the chemistry lab block after practical session.',
    address: 'Chemistry Lab Block, Ground Floor',
    type: 'lost',
    clothing: true,
    college: true,
    imageUrls: [UNS('photo-1576086213369-97a306d36557')],
  },
  {
    userIndex: 2,
    name: 'JBL Clip 4 Bluetooth Speaker',
    description:
      'Orange JBL Clip 4 portable Bluetooth speaker with the carabiner clip intact. Found on a window ledge in Hostel P-Block corridor. Fully charged. Please contact to collect.',
    address: 'Hostel P-Block, Second Floor Corridor',
    type: 'found',
    gadgets: true,
    imageUrls: [UNS('photo-1545454675-3531b543be5d')],
  },
  {
    userIndex: 3,
    name: 'Steel Thermos Flask (500 ml)',
    description:
      'Silver stainless-steel thermos flask, 500 ml. Has a dent near the base and a "TIET Fest 2024" sticker on the side. Lost at the gymnasium — left it by the treadmill area.',
    address: 'Gymnasium, TBI Block',
    type: 'lost',
    other: true,
    imageUrls: [UNS('photo-1544025162-d76538809ffe')],
  },
  {
    userIndex: 0,
    name: 'Complete Geometry Box Set',
    description:
      'Camlin geometry box with compass, divider, set squares, protractor, and scale — all pieces present. Name label "Arjun K." inside the lid. Found on a desk in Block D, Room 301 after morning class.',
    address: 'Block D, Room 301',
    type: 'found',
    college: true,
    imageUrls: [UNS('photo-1611532736597-de2d4265fba3')],
  },
  {
    userIndex: 1,
    name: 'AirPods (2nd Gen) in White Case',
    description:
      'Apple AirPods 2nd generation in a white charging case. Case has a small scratch on the lid. Lost somewhere in the library — last used while studying in the reading room.',
    address: 'Central Library, Reading Room',
    type: 'lost',
    gadgets: true,
    imageUrls: [UNS('photo-1572635196237-14b3f281503f')],
  },
];

async function seedAdd() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB\n');

    // Find existing demo users
    const users = await User.find({ email: { $in: DEMO_EMAILS } }).lean();
    if (users.length !== DEMO_EMAILS.length) {
      console.error(`Expected ${DEMO_EMAILS.length} demo users, found ${users.length}. Run the main seed first.`);
      process.exit(1);
    }

    // Build an email → user map
    const userByEmail = {};
    users.forEach((u) => { userByEmail[u.email] = u; });
    const orderedUsers = DEMO_EMAILS.map((e) => userByEmail[e]);

    // Build docs with required boolean defaults
    const docs = NEW_LISTINGS.map(({ userIndex, ...rest }) => ({
      clothing:    false,
      college:     false,
      gadgets:     false,
      books:       false,
      accessories: false,
      other:       false,
      resolved:    false,
      ...rest,
      userRef: orderedUsers[userIndex]._id.toString(),
    }));

    const inserted = await Listing.insertMany(docs);
    console.log(`Inserted ${inserted.length} new listings:`);
    inserted.forEach((l) => console.log(`  [${l.type.toUpperCase()}] ${l.name}`));
    console.log('\nDone.');
  } catch (err) {
    console.error('seed-add failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdd();
