// In-memory storage for notifications (replace with database in production)
const notifications = new Map();

// Notification Controller
export const getNotifications = (req, res) => {
  try {
    const userId = req.user.id;
    const userNotifications = Array.from(notifications.values())
      .filter(notif => notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50); // Limit to last 50 notifications

    res.json({
      notifications: userNotifications,
      unreadCount: userNotifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notification as read
export const markAsRead = (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = notifications.get(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    notification.read = true;
    notification.readAt = new Date().toISOString();
    notifications.set(notificationId, notification);

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark all notifications as read
export const markAllAsRead = (req, res) => {
  try {
    const userId = req.user.id;
    const userNotifications = Array.from(notifications.values())
      .filter(notif => notif.userId === userId && !notif.read);

    userNotifications.forEach(notification => {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      notifications.set(notification.id, notification);
    });

    res.json({
      success: true,
      markedCount: userNotifications.length
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete notification
export const deleteNotification = (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = notifications.get(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    notifications.delete(notificationId);

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send notification (internal function used by other controllers)
export const sendNotification = (userId, type, title, message, data = {}) => {
  try {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type, // 'queue_update', 'consultation_started', 'consultation_ended', 'doctor_status', etc.
      title,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString(),
      readAt: null
    };

    notifications.set(notification.id, notification);

    // In a real app, you might also send push notifications here
    return notification;
  } catch (error) {
    console.error('Send notification error:', error);
    return null;
  }
};

// Send real-time notification via WebSocket
export const sendRealTimeNotification = (req, userId, type, title, message, data = {}) => {
  try {
    const notification = sendNotification(userId, type, title, message, data);
    
    if (notification) {
      const io = req.app.get('io');
      io.to(`user-${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Send real-time notification error:', error);
    return null;
  }
};

// Get notification settings
export const getNotificationSettings = (req, res) => {
  try {
    // In a real app, this would come from user preferences in database
    const defaultSettings = {
      queueUpdates: true,
      consultationReminders: true,
      doctorStatusChanges: true,
      generalAnnouncements: true,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false
    };

    res.json({
      settings: defaultSettings
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update notification settings
export const updateNotificationSettings = (req, res) => {
  try {
    const { settings } = req.body;
    
    // In a real app, save to database
    // For now, just return success
    
    res.json({
      success: true,
      settings,
      message: 'Notification settings updated'
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send test notification (for testing purposes)
export const sendTestNotification = (req, res) => {
  try {
    const notification = sendRealTimeNotification(
      req,
      req.user.id,
      'test',
      'Test Notification',
      'This is a test notification to verify the system is working.',
      { testData: true }
    );

    res.json({
      success: true,
      notification,
      message: 'Test notification sent'
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  sendRealTimeNotification,
  getNotificationSettings,
  updateNotificationSettings,
  sendTestNotification
};
