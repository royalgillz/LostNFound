import express from 'express';
import {
  createListing,
  deleteListing,
  updateListing,
  resolveListing,
  getListing,
  getListings,
} from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { createRateLimiter } from '../utils/rateLimit.js';

const router = express.Router();
const listingWriteLimiter = createRateLimiter({ windowMs: 60_000, max: 30, keyPrefix: 'listing-write' });

router.post('/create',       verifyToken, listingWriteLimiter, createListing);
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id',   verifyToken, listingWriteLimiter, updateListing);
router.patch('/resolve/:id', verifyToken, listingWriteLimiter, resolveListing);
router.get('/get/:id',       getListing);
router.get('/get',           getListings);

export default router;
