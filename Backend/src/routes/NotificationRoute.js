import express from 'express';
import { 
  createNotification, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '../controllers/NotificationController.js';

const router = express.Router();

// Create a new notification
router.post('/', createNotification);

// Get notifications for a user
router.get('/user/:userId', getUserNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

export default router; 