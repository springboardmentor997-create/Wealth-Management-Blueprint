import { Bell, Search, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileSidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      
      // Listen for updates from other components (like Notifications page)
      const handleUpdate = () => fetchNotifications();
      window.addEventListener('notifications:updated', handleUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener('notifications:updated', handleUpdate);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => n.is_read === 'false').length);
    } catch (error: any) {
      if (error.message !== 'Invalid authentication credentials') {
        console.error("Failed to fetch notifications", error);
      }
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (notif.is_read === 'false') {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => 
          n.id === notif.id ? { ...n, is_read: 'true' } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {
        console.error(e);
      }
    }
    
    // Navigate based on type
    const routes: Record<string, string> = {
      'portfolio': '/portfolio',
      'goal': '/goals',
      'system': '/settings',
      'alert': '/dashboard',
      'recommendation': '/recommendations'
    };
    
    setIsNotificationsOpen(false);
    navigate(routes[notif.type] || '/dashboard');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    // Adjust for timezone differences if server is UTC and client is local, usually straightforward if strings are ISO Z
    // Assuming backend returns UTC ISO string
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex items-center gap-4 flex-1">
        <MobileSidebar />
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assets, goals..."
            className="pl-10 bg-secondary border-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/goals?q=${encodeURIComponent(searchTerm)}`);
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} new</span>}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.filter(n => n.is_read === 'false').length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                notifications
                  .filter(notif => notif.is_read === 'false')
                  .map((notif) => (
                  <div key={notif.id}>
                    <DropdownMenuItem 
                      className="flex flex-col items-start gap-1 p-3 cursor-pointer bg-accent/20"
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex w-full justify-between items-center">
                        <span className="text-sm font-semibold">
                          {notif.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(notif.created_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notif.message}
                      </p>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                ))
              )}
            </div>
            <DropdownMenuItem 
              className="justify-center text-primary font-medium cursor-pointer"
              onClick={() => {
                setIsNotificationsOpen(false);
                navigate('/notifications');
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 md:gap-3 focus:outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Avatar className="h-9 w-9">
                {user?.profile_picture ? (
                  <AvatarImage 
                    src={user.profile_picture.startsWith('data:') ? user.profile_picture : `${API_BASE_URL}${user.profile_picture}`} 
                    alt={userName} 
                  />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 sm:hidden">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
