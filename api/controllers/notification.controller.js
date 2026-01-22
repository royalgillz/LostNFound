import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'info', meta = {} } = req.body;
    if (!title || !message) return next(errorHandler(400, 'Title and message are required.'));
    const notification = await Notification.create({
      userRef: req.user.id,
      title,
      message,
      type,
      meta,
      read: false,
    });
    return res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

export const getMyNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const notifications = await Notification.find({ userRef: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);
    return res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return next(errorHandler(404, 'Notification not found.'));
    if (notification.userRef !== req.user.id) return next(errorHandler(403, 'Forbidden.'));
    notification.read = true;
    await notification.save();
    return res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userRef: req.user.id, read: false }, { $set: { read: true } });
    const notifications = await Notification.find({ userRef: req.user.id }).sort({ createdAt: -1 }).limit(200);
    return res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const clearNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userRef: req.user.id });
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
