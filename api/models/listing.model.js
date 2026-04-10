import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    // categories
    clothing:    { type: Boolean, required: true },
    college:     { type: Boolean, required: true },
    gadgets:     { type: Boolean, required: true },
    books:       { type: Boolean, default: false },
    accessories: { type: Boolean, default: false },
    other:       { type: Boolean, default: false },
    // when the item was actually lost / found (user-supplied)
    date: {
      type: Date,
      default: Date.now,
    },
    // owner marked item as returned / claimed
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: String,
      default: null,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
