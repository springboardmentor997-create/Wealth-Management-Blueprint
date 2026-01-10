import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Users, Activity, BarChart3, Shield } from 'lucide-react';
import { UsersTab } from '@/components/admin/UsersTab';
import { ActivityTab } from '@/components/admin/ActivityTab';
import { PerformanceTab } from '@/components/admin/PerformanceTab';
import { ReportsTab } from '@/components/admin/ReportsTab';

export default function AdminDashboard() {
  const { isAdmin, adminLoading, adminSignOut } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/admin-login');
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleSignOut = () => {
    adminSignOut();
    navigate('/admin-login');
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="relative border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50 overflow-hidden">
        {/* Header Background */}
        <div className="absolute inset-0 z-0">
           <img 
              src="/images/wealth-theme.jpg" 
              className="w-full h-full object-cover opacity-5" 
              alt="Background"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/80 to-background/50" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">WealthTrack Management</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTab />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
