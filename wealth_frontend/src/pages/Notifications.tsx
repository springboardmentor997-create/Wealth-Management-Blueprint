import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2, Calendar, CheckCheck } from 'lucide-react';
import { notificationService, Notification } from '@/services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      // "Vanish" means we only show unread items.
      // We check !== 'true' to be robust against "false" vs false, and default to showing if unsure.
      setNotifications(data.filter(n => String(n.is_read) !== 'true'));
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      // Remove from list immediately to make it "vanish"
      setNotifications(prev => prev.filter(n => n.id !== id));
      
       // Emit event to update header badge count if needed
       window.dispatchEvent(new Event('notifications:updated'));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };
  
  // TODO: Add bulk actions in backend first
  // const handleMarkAllAsRead = async () => { ... }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'goal': return 'bg-green-100 text-green-700';
      case 'portfolio': return 'bg-blue-100 text-blue-700';
      case 'alert': return 'bg-red-100 text-red-700';
      case 'system': return 'bg-gray-100 text-gray-700';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your financial progress</p>
          </div>
          <Button variant="outline" onClick={fetchNotifications}>
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-20" />
                <p>No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card key={notif.id} className={`transition-colors ${notif.is_read === 'false' ? 'border-primary/50 bg-primary/5' : ''}`}>
                <CardContent className="p-4 flex gap-4 items-start">
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${notif.is_read === 'false' ? 'bg-primary' : 'bg-transparent'}`} />
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{notif.title}</span>
                        <Badge variant="secondary" className={`text-xs ${getTypeColor(notif.type)}`}>
                          {notif.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatTime(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                  </div>
                  
                  {notif.is_read === 'false' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleMarkAsRead(notif.id)}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {notif.is_read === 'true' && (
                     <CheckCheck className="h-4 w-4 text-muted-foreground/30 mt-2" />
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
