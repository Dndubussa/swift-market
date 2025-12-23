import { supabase } from '../supabase';

/**
 * Notification Service - Handles all notification operations
 */

const NOTIFICATION_TYPES = {
  // Orders
  new_order: { icon: 'ShoppingCartIcon', color: 'bg-primary', title: 'New Order' },
  order_cancelled: { icon: 'XCircleIcon', color: 'bg-error', title: 'Order Cancelled' },
  order_confirmed: { icon: 'CheckCircleIcon', color: 'bg-success', title: 'Order Confirmed' },
  order_shipped: { icon: 'TruckIcon', color: 'bg-info', title: 'Order Shipped' },
  order_delivered: { icon: 'CheckBadgeIcon', color: 'bg-success', title: 'Order Delivered' },
  
  // Returns
  return_request: { icon: 'ArrowUturnLeftIcon', color: 'bg-warning', title: 'Return Request' },
  return_approved: { icon: 'CheckCircleIcon', color: 'bg-success', title: 'Return Approved' },
  return_rejected: { icon: 'XCircleIcon', color: 'bg-error', title: 'Return Rejected' },
  refund_processed: { icon: 'BanknotesIcon', color: 'bg-success', title: 'Refund Processed' },
  
  // Payouts
  payout_requested: { icon: 'BanknotesIcon', color: 'bg-warning', title: 'Payout Requested' },
  payout_processing: { icon: 'ClockIcon', color: 'bg-info', title: 'Payout Processing' },
  payout_completed: { icon: 'CheckCircleIcon', color: 'bg-success', title: 'Payout Completed' },
  payout_failed: { icon: 'XCircleIcon', color: 'bg-error', title: 'Payout Failed' },
  
  // Disputes
  dispute_opened: { icon: 'ChatBubbleLeftRightIcon', color: 'bg-warning', title: 'New Dispute' },
  dispute_response: { icon: 'ChatBubbleLeftIcon', color: 'bg-info', title: 'Dispute Response' },
  dispute_vendor_response: { icon: 'ChatBubbleLeftIcon', color: 'bg-info', title: 'Vendor Response' },
  dispute_resolution_proposed: { icon: 'LightBulbIcon', color: 'bg-accent', title: 'Resolution Proposed' },
  dispute_escalated: { icon: 'ArrowUpIcon', color: 'bg-error', title: 'Dispute Escalated' },
  dispute_resolved: { icon: 'CheckCircleIcon', color: 'bg-success', title: 'Dispute Resolved' },
  
  // Products
  low_stock: { icon: 'ExclamationTriangleIcon', color: 'bg-warning', title: 'Low Stock Alert' },
  out_of_stock: { icon: 'XCircleIcon', color: 'bg-error', title: 'Out of Stock' },
  product_approved: { icon: 'CheckCircleIcon', color: 'bg-success', title: 'Product Approved' },
  product_rejected: { icon: 'XCircleIcon', color: 'bg-error', title: 'Product Rejected' },
  
  // Reviews
  new_review: { icon: 'StarIcon', color: 'bg-accent', title: 'New Review' },
  
  // System
  system: { icon: 'BellIcon', color: 'bg-muted', title: 'System Notification' },
  announcement: { icon: 'MegaphoneIcon', color: 'bg-primary', title: 'Announcement' },
  
  // Default
  default: { icon: 'BellIcon', color: 'bg-muted', title: 'Notification' }
};

/**
 * Get all notifications for a user
 * @param {string} userId - The user ID
 * @param {Object} options - Query options
 * @returns {Promise<{notifications: Object[], count: number, unreadCount: number}>}
 */
export async function getNotifications(userId, options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type = null
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (type) {
      query = query.eq('type', type);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], count: 0, unreadCount: 0 };
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    // Add type info to notifications
    const notificationsWithInfo = (data || []).map(n => ({
      ...n,
      typeInfo: NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.default
    }));

    return {
      notifications: notificationsWithInfo,
      count: count || 0,
      unreadCount: unreadCount || 0
    };
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return { notifications: [], count: 0, unreadCount: 0 };
  }
}

/**
 * Get recent notifications for dropdown
 * @param {string} userId - The user ID
 * @param {number} limit - Number of notifications to fetch
 * @returns {Promise<{notifications: Object[], unreadCount: number}>}
 */
export async function getRecentNotifications(userId, limit = 5) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    // Add type info
    const notificationsWithInfo = (data || []).map(n => ({
      ...n,
      typeInfo: NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.default
    }));

    return {
      notifications: notificationsWithInfo,
      unreadCount: unreadCount || 0
    };
  } catch (error) {
    console.error('Error in getRecentNotifications:', error);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Get unread notification count
 * @param {string} userId - The user ID
 * @returns {Promise<number>}
 */
export async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return 0;
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID
 * @param {string} userId - The user ID (for authorization)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function markAsRead(notificationId, userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark all notifications as read
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function markAllAsRead(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a notification
 * @param {string} notificationId - The notification ID
 * @param {string} userId - The user ID (for authorization)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteNotification(notificationId, userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete all read notifications
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteReadNotifications(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteReadNotifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a notification (for internal use)
 * @param {string} userId - The user ID to notify
 * @param {Object} notificationData - The notification data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createNotification(userId, notificationData) {
  try {
    const {
      type,
      title,
      message,
      link = null,
      data = null
    } = notificationData;

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        link,
        data,
        is_read: false
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in createNotification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get notification type info
 * @param {string} type - The notification type
 * @returns {Object}
 */
export function getNotificationTypeInfo(type) {
  return NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.default;
}

/**
 * Get all notification types
 * @returns {Object}
 */
export function getNotificationTypes() {
  return NOTIFICATION_TYPES;
}

/**
 * Subscribe to real-time notifications
 * @param {string} userId - The user ID
 * @param {Function} callback - Callback for new notifications
 * @returns {Object} Subscription object
 */
export function subscribeToNotifications(userId, callback) {
  const subscription = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const notification = {
          ...payload.new,
          typeInfo: NOTIFICATION_TYPES[payload.new.type] || NOTIFICATION_TYPES.default
        };
        callback(notification);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Unsubscribe from notifications
 * @param {Object} subscription - The subscription object
 */
export function unsubscribeFromNotifications(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}
