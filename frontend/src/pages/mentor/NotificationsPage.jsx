import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiCall, ENDPOINTS } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  CheckCircle,
  Trophy,
  Trees,
  Zap,
  RefreshCw,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === 'unread';
      const res = await apiCall(
        `${ENDPOINTS.NOTIFICATIONS}?unread_only=${unreadOnly}`,
        { method: 'GET' }
      );

      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
    // Polling every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await apiCall(
        `${ENDPOINTS.NOTIFICATIONS}/${notificationId}/mark-as-read/`,
        { method: 'POST' }
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        toast({
          title: 'Marked as read',
          description: 'Notification marked as read',
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await apiCall(
        `${ENDPOINTS.NOTIFICATIONS}/mark-all-as-read/`,
        { method: 'POST' }
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        toast({
          title: 'All marked as read',
          description: 'All notifications marked as read',
        });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tree_verified':
        return <Trees className="w-5 h-5 text-green-500" />;
      case 'points_awarded':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'milestone':
        return <Trophy className="w-5 h-5 text-blue-500" />;
      case 'leaderboard_update':
        return <Trophy className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'tree_verified':
        return 'bg-green-50 border-green-200';
      case 'points_awarded':
        return 'bg-yellow-50 border-yellow-200';
      case 'milestone':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchNotifications}
            variant="outline"
            size="icon"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          onClick={() => {
            setFilter('all');
            fetchNotifications();
          }}
          className="rounded-b-none"
        >
          All Notifications
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'ghost'}
          onClick={() => {
            setFilter('unread');
            fetchNotifications();
          }}
          className="rounded-b-none"
        >
          Unread
          {unreadCount > 0 && (
            <Badge className="ml-2" variant="secondary">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 rounded-lg border border-dashed">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll receive notifications when mentors verify your trees
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${getNotificationColor(
                notification.notification_type
              )} border transition hover:shadow-md ${
                !notification.is_read ? 'border-l-4' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>

                        {notification.tree_species && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {notification.tree_species}
                            </Badge>
                            {notification.points_awarded > 0 && (
                              <Badge variant="secondary">
                                +{notification.points_awarded} pts
                              </Badge>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-3">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleMarkAsRead(notification.id)
                            }
                            className="text-xs"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
