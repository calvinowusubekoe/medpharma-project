import express from 'express';
import { authenticateToken } from './authRoute.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  sendTestNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

// Notification management routes
router.get('/', getNotifications);
router.put('/:notificationId/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:notificationId', deleteNotification);

// Notification settings routes
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);

// Test route (for development)
router.post('/test', sendTestNotification);

export default router;
