/**
 * Seed script — creates demo users and sample listings.
 * Run from LostNFound/ directory:
 *   node api/seed.js
 *
 * Clears existing demo data first, then re-inserts.
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Listing from './models/listing.model.js';

dotenv.config();

const RAW = (file) =>
  `https://raw.githubusercontent.com/royalgillz/LostNFound/master/client/src/images/${file}`;

// ── Demo users ──────────────────────────────────────────────────────────────
const USERS = [
  { username: 'rahul_sharma',  email: 'rahul@thapar.edu',  password: 'Demo@1234' },
  { username: 'priya_singh',   email: 'priya@thapar.edu',  password: 'Demo@1234' },
  { username: 'aman_gupta',    email: 'aman@thapar.edu',   password: 'Demo@1234' },
  { username: 'neha_verma',    email: 'neha@thapar.edu',   password: 'Demo@1234' },
];

// ── Sample listings ─────────────────────────────────────────────────────────
// userIndex maps to USERS array above (0–3)
const LISTINGS = [
  // ── Rahul's listings
  {
    userIndex: 0,
    name: 'MacBook Charger (USB-C, 61W)',
    description:
      'White Apple 61W USB-C charger. Has a small nick on the cable near the brick end. Left it on a desk in the computer lab after the evening session. Please reach out if found.',
    address: 'Computer Centre, Lab 3',
    type: 'lost',
    gadgets: true,
    imageUrls: [RAW('charger.png')],
  },
  {
    userIndex: 0,
    name: 'Student ID Card — Priya Sharma',
    description:
      'Thapar University student ID. Name: Priya Sharma, Roll No: 102153040, Branch: ECE. Found near the main gate security booth. Please collect or contact to arrange return.',
    address: 'Main Gate Security Booth',
    type: 'found',
    college: true,
    imageUrls: [RAW('ID.png')],
    resolved: true,
  },
  {
    userIndex: 0,
    name: 'Silver MacBook Pro 13"',
    description:
      'Silver MacBook Pro 13-inch (M1, 2020) in a dark grey sleeve. Has a "TIET CSE" sticker on the lid. Last seen in LHC-4 after the afternoon lecture. If found, please contact urgently.',
    address: 'LHC Block, Lecture Hall 4',
    type: 'lost',
    gadgets: true,
    imageUrls: [RAW('macbook.png')],
  },
  {
    userIndex: 0,
    name: 'Brown Leather Wallet',
    description:
      'Brown bi-fold leather wallet with a college bus pass, Axis Bank debit card, and around ₹300 cash inside. Found on a bench near the sports ground. Handing over to security if unclaimed.',
    address: 'Sports Ground, Near Seating Area',
    type: 'found',
    accessories: true,
    imageUrls: [RAW('wallet.png')],
  },

  // ── Priya's listings
  {
    userIndex: 1,
    name: 'Scientific Calculator (Casio fx-991ES)',
    description:
      'Casio fx-991ES Plus calculator with a black hard case. Name "Rohan" is written on the back with a marker. Found on a desk in the reading room after the exam rush.',
    address: 'Main Library, Reading Room',
    type: 'found',
    college: true,
    imageUrls: [RAW('calculator.png')],
  },
  {
    userIndex: 1,
    name: 'Reading Glasses (Black Frame)',
    description:
      'Black rectangular reading glasses in a brown faux-leather case. Found on a cafeteria table during lunch hours. Power seems mild. Please claim before they are handed in.',
    address: 'Cafeteria, Main Food Court',
    type: 'found',
    accessories: true,
    imageUrls: [RAW('glasses.png')],
    resolved: true,
  },
  {
    userIndex: 1,
    name: 'Anker Power Bank (20000 mAh)',
    description:
      'Black Anker PowerCore 20000 mAh power bank with a micro-USB charging cable wrapped around it. Lost somewhere between the hostel and Block D. Has a small scratch on one corner.',
    address: 'Hostel P-Block to Block D Route',
    type: 'lost',
    gadgets: true,
    imageUrls: [RAW('power bank.png')],
  },
  {
    userIndex: 1,
    name: 'Fastrack Analog Watch',
    description:
      'Fastrack analog watch with a brown leather strap and a round black dial. Lost during the sports session. Has a small monogram "PK" engraved on the case back.',
    address: 'Basketball Court, Sports Complex',
    type: 'lost',
    accessories: true,
    imageUrls: [RAW('watch.png')],
  },

  // ── Aman's listings
  {
    userIndex: 2,
    name: 'Black Canvas Backpack',
    description:
      'Medium-sized black canvas backpack. Has two main compartments and a front zip pocket. Contains some printed notes and a geometry box inside. Left at the LHC entrance.',
    address: 'LHC Block, Main Entrance',
    type: 'lost',
    clothing: true,
    imageUrls: [RAW('bag.png')],
  },
  {
    userIndex: 2,
    name: 'JBL Tune 230 Earbuds',
    description:
      'White JBL Tune 230 TWS earbuds in a white charging case. Case has a small blue dot sticker on the lid. Found under a seat in Workshop Block during cleanup.',
    address: 'Workshop Block, Ground Floor',
    type: 'found',
    gadgets: true,
    imageUrls: [RAW('earbuds.png')],
  },
  {
    userIndex: 2,
    name: 'Blue Denim Jacket',
    description:
      'Light-wash denim jacket, size M. Has small embroidered patches on both sleeves and a torn inner pocket label. Lost during the cultural fest in the open-air amphitheatre.',
    address: 'Open Air Amphitheatre',
    type: 'lost',
    clothing: true,
    imageUrls: [RAW('jacket.png')],
  },
  {
    userIndex: 2,
    name: 'Pencil Box (Blue, Camlin)',
    description:
      'Blue Camlin pencil box with pencils, a sharpener, eraser, and a small ruler inside. "Aman G." is written in permanent marker on the lid. Found in Block B, Room 204.',
    address: 'Block B, Room 204',
    type: 'found',
    college: true,
    imageUrls: [RAW('pencil box.png')],
    resolved: true,
  },

  // ── Neha's listings
  {
    userIndex: 3,
    name: 'iPhone 14 (Midnight Black)',
    description:
      'Midnight black iPhone 14 in a transparent back case. Screen has no cracks. Wallpaper shows a mountain photo. Last seen on a hostel Q-block common room table. Please contact urgently.',
    address: 'Hostel Q-Block, Common Room',
    type: 'lost',
    gadgets: true,
    imageUrls: [RAW('iphone.png')],
  },
  {
    userIndex: 3,
    name: 'Mini Drafter / Drawing Board Set',
    description:
      'Full mini drafter set with scales, set-squares, and a protractor. Stored in a long plastic case labelled "CE Dept." Found leaning against the wall in the drawing hall after class.',
    address: 'Drawing Hall, Block E',
    type: 'found',
    college: true,
    imageUrls: [RAW('drafter.png')],
  },
  {
    userIndex: 3,
    name: 'Keys with Red Keychain',
    description:
      'A bunch of 4 keys on a red carabiner keychain. One key has a TIET hostel room tag (Room 114). Found on the library steps in the morning. Please contact to collect.',
    address: 'Main Library, Front Steps',
    type: 'found',
    accessories: true,
    imageUrls: [RAW('keys.png')],
  },
  {
    userIndex: 3,
    name: 'Black Leather Purse',
    description:
      'Small black faux-leather purse with a gold clasp. Contains a metro card and some coins. No ID inside. Found on a bench in the Admin Block corridor during office hours.',
    address: 'Admin Block, Ground Floor Corridor',
    type: 'found',
    accessories: true,
    imageUrls: [RAW('purse.png')],
  },
  {
    userIndex: 3,
    name: 'Stick File / Document Folder',
    description:
      'Green A4 stick file with about 30 pages of printed assignment sheets inside. Cover page reads "IT Workshop — 2nd Year". Found on the printer table in the computer lab.',
    address: 'Computer Centre, Lab 1',
    type: 'found',
    college: true,
    imageUrls: [RAW('stick file.png')],
    resolved: true,
  },
  {
    userIndex: 2,
    name: 'Water Bottle (Milton Steel)',
    description:
      'Silver 1-litre Milton steel water bottle with a flip-top lid. Has a small dent on the side and a "TIET" printed sticker. Left behind near the gym equipment area.',
    address: 'Gymnasium, TBI Block',
    type: 'lost',
    imageUrls: [RAW('OIP.jpg')],
  },
];

// ── Seed ────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB\n');

    const demoEmails = USERS.map((u) => u.email);

    // Remove existing demo data
    const existing = await User.find({ email: { $in: demoEmails } });
    const existingIds = existing.map((u) => u._id);
    if (existingIds.length) {
      await Listing.deleteMany({ userRef: { $in: existingIds.map(String) } });
      await User.deleteMany({ _id: { $in: existingIds } });
      console.log(`Removed ${existingIds.length} existing demo user(s) and their listings.\n`);
    }

    // Create users
    const createdUsers = await Promise.all(
      USERS.map(async (u) => {
        const hashed = bcryptjs.hashSync(u.password, 10);
        return User.create({ ...u, password: hashed });
      })
    );
    console.log('Created users:');
    createdUsers.forEach((u) => console.log(`  ${u.username} <${u.email}>`));
    console.log();

    // Create listings — fill missing required booleans with false
    const docs = LISTINGS.map((l) => {
      const { userIndex, ...rest } = l;
      return {
        clothing:    false,
        college:     false,
        gadgets:     false,
        books:       false,
        accessories: false,
        other:       false,
        resolved:    false,
        ...rest,
        userRef: createdUsers[userIndex]._id.toString(),
      };
    });

    const inserted = await Listing.insertMany(docs);
    console.log(`Inserted ${inserted.length} listings:`);
    inserted.forEach((l) => console.log(`  [${l.type.toUpperCase()}${l.resolved ? ' ✓' : ''}] ${l.name}`));

    console.log('\nAll demo users share password: Demo@1234');
    console.log('Done.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
