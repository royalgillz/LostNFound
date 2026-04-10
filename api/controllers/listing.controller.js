import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

const BLOCKED_IMAGE_HINTS = ['nsfw', 'porn', 'explicit'];

const validateListingPayload = (payload) => {
  if (payload.website) {
    return 'Invalid submission detected.';
  }
  if (!Array.isArray(payload.imageUrls) || payload.imageUrls.length < 1) {
    return 'At least one image is required.';
  }
  if (payload.imageUrls.length > 6) {
    return 'Maximum 6 images allowed.';
  }
  const invalidImage = payload.imageUrls.find((url) => {
    const safeUrl = String(url || '').toLowerCase();
    return !safeUrl.startsWith('http') || BLOCKED_IMAGE_HINTS.some((hint) => safeUrl.includes(hint));
  });
  if (invalidImage) {
    return 'One or more images failed moderation checks.';
  }
  return '';
};

export const createListing = async (req, res, next) => {
  try {
    const validationError = validateListingPayload(req.body);
    if (validationError) return next(errorHandler(400, validationError));
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const validationError = validateListingPayload(req.body);
    if (validationError) return next(errorHandler(400, validationError));
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const resolveListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, 'You can only resolve your own listings!'));
    }
    const nextResolved = !listing.resolved;
    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        resolved: nextResolved,
        resolvedAt: nextResolved ? new Date() : null,
        resolvedBy: nextResolved ? req.user.id : null,
      },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit      = Math.max(parseInt(req.query.limit) || 9, 1);
    const startIndex = Math.max(parseInt(req.query.startIndex) || 0, 0);

    // category filters — only apply when explicitly set to true
    // (keeps legacy docs with undefined category fields visible)
    const categoryQuery = {};
    if (req.query.gadgets      === 'true') categoryQuery.gadgets      = true;
    if (req.query.college      === 'true') categoryQuery.college      = true;
    if (req.query.clothing     === 'true') categoryQuery.clothing     = true;
    if (req.query.books        === 'true') categoryQuery.books        = true;
    if (req.query.accessories  === 'true') categoryQuery.accessories  = true;
    if (req.query.other        === 'true') categoryQuery.other        = true;

    let type = req.query.type;
    if (!type || type === 'all') {
      type = { $in: ['lost', 'found'] };
    }

    const searchTerm = (req.query.searchTerm || '').trim();
    const sort       = req.query.sort  || 'createdAt';
    const order      = req.query.order || 'desc';
    const relevance  = req.query.relevance === 'true' && searchTerm.length > 0;

    const query = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } },
      ],
      type,
      ...categoryQuery,
    };

    // resolved filter — 'true' = only resolved, 'false' = only unresolved, omit = all
    if (req.query.resolved === 'true')  query.resolved = true;
    if (req.query.resolved === 'false') query.resolved = false;

    const total = await Listing.countDocuments(query);

    let listings = await Listing.find(query)
      .sort({ [sort]: order })
      .limit(relevance ? 120 : limit)
      .skip(startIndex);

    if (relevance) {
      const tokens = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      listings = listings
        .map((listing) => {
          const text = `${listing.name} ${listing.description} ${listing.address}`.toLowerCase();
          const tokenScore = tokens.reduce((score, token) => (text.includes(token) ? score + 2 : score), 0);
          const exactBoost = listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 3 : 0;
          const recencyBoost = listing.createdAt ? 1 / (1 + (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7)) : 0;
          return { listing, score: tokenScore + exactBoost + recencyBoost };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.listing);
    }

    const hasMore = startIndex + listings.length < total;
    return res.status(200).json({ items: listings, total, hasMore });
  } catch (error) {
    next(error);
  }
};
