'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications
} from '@/lib/services/notificationService';
import Icon from '@/components/ui/AppIcon';

const FILTER_TYPES = [
  { value: 'all', label: 'All Notifications' },
  { value: 'unread', label: 'Unread Only' },
  { value: 'new_order', label: 'Orders' },
  { value: 'return_request', label: 'Returns' },
  { value: 'dispute_opened', label: 'Disputes' },
  { value: 'payout_completed', label: 'Payouts' },
  { value: 'low_stock', label: 'Stock Alerts' },
  { value: 'new_review', label: 'Reviews' },
];

export default function NotificationsCenterInteractive({ role = 'vendor' }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Filters
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const pageSize = 20;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/user-login');
        return;
      }
      
      loadNotifications();
    }
  }, [user, authLoading, router, filterType, currentPage]);

  const loadNotifications = async () => {
    setLoading(true);
    
    const isUnreadFilter = filterType === 'unread';
    const typeFilter = !isUnreadFilter && filterType !== 'all' ? filterType : null;
    
    const { notifications: fetched, count, unreadCount: unread } = await getNotifications(user.id, {
      page: currentPage,
      limit: pageSize,
      unreadOnly: isUnreadFilter,
      type: typeFilter
    });
    
    setNotifications(fetched);
    setTotalCount(count);
    setUnreadCount(unread);
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await markAsRead(notificationId, user.id);
    if (result.success) {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead(user.id);
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const handleDelete = async (notificationId) => {
    const result = await deleteNotification(notificationId, user.id);
    if (result.success) {
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setTotalCount(prev => prev - 1);
      if (!deletedNotification?.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm('Delete all read notifications?')) return;
    
    const result = await deleteReadNotifications(user.id);
    if (result.success) {
      setNotifications(prev => prev.filter(n => !n.is_read));
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <DashboardLayout
      role={role}
      title="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
      badges={{ notifications: unreadCount }}
      actions={
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
            >
              <Icon name="CheckIcon" size={16} />
              <span className="hidden sm:inline">Mark All Read</span>
            </button>
          )}
          <button
            onClick={handleDeleteAllRead}
            className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm flex items-center gap-2"
          >
            <Icon name="TrashIcon" size={16} />
            <span className="hidden sm:inline">Clear Read</span>
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_TYPES.map(filter => (
            <button
              key={filter.value}
              onClick={() => {
                setFilterType(filter.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter.label}
              {filter.value === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-error text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="BellIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Notifications</h3>
              <p className="text-muted-foreground">
                {filterType === 'unread' 
                  ? 'You\'ve read all your notifications.'
                  : filterType !== 'all'
                  ? 'No notifications of this type.'
                  : 'You don\'t have any notifications yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/30 transition-colors ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${notification.typeInfo?.color || 'bg-muted'}`}>
                      <Icon 
                        name={notification.typeInfo?.icon || 'BellIcon'} 
                        size={20} 
                        className="text-white" 
                      />
                    </div>
                    
                    {/* Content */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                            {!notification.is_read && (
                              <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block"></span>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      
                      {notification.link && (
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                          View details <Icon name="ArrowRightIcon" size={12} />
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Icon name="CheckIcon" size={16} className="text-muted-foreground" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="p-1.5 hover:bg-error/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Icon name="XMarkIcon" size={16} className="text-muted-foreground hover:text-error" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

