import express from 'express';
import {
  clearNotifications,
  createNotification,
  getMyNotifications,
  markAllRead,
  markNotificationRead,
} from '../controllers/notification.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { createRateLimiter } from '../utils/rateLimit.js';

const router = express.Router();
const notifyLimiter = createRateLimiter({ windowMs: 60_000, max: 60, keyPrefix: 'notify' });

router.post('/', verifyToken, notifyLimiter, createNotification);
router.get('/', verifyToken, getMyNotifications);
router.patch('/read-all', verifyToken, notifyLimiter, markAllRead);
router.patch('/:id/read', verifyToken, notifyLimiter, markNotificationRead);
router.delete('/', verifyToken, notifyLimiter, clearNotifications);

export default router;
