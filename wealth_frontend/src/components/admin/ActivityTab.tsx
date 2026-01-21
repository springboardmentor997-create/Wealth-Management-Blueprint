import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Target, Briefcase, Settings, Calculator, Shield, Loader2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

// Define the interface based on backend response
interface ActivityLogItem {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  category: string;
  details: string;
  timestamp: string;
  document_url?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


const categoryIcons: Record<string, React.ReactNode> = {
  auth: <Shield className="h-4 w-4" />,
  goal: <Target className="h-4 w-4" />,
  portfolio: <Briefcase className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  calculator: <Calculator className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  auth: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  goal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  portfolio: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  settings: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  calculator: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const getDefaultIcon = () => <Shield className="h-4 w-4" />;
const getDefaultColor = () => 'bg-gray-500/20 text-gray-400 border-gray-500/30';

export function ActivityTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => apiClient.getAdminDashboard().then(res => res.data),
  });

  const logs: ActivityLogItem[] = dashboardData?.recent_activities || [];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Backend categories might be lower case, ensuring matching
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const formatTimestamp = (timestamp: string) => {
    try {
        return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
    } catch (e) {
        return timestamp;
    }
  };

  if (isLoading) {
      return (
          <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>Track all user actions and system events</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="goal">Goals</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="calculator">Calculator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
            >
              <div className={`p-2 rounded-lg border ${categoryColors[log.category] || getDefaultColor()}`}>
                {categoryIcons[log.category] || getDefaultIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{log.action}</span>
                  <Badge variant="outline" className="w-fit">
                    {log.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {log.user_name}
                  </span>
                  <span>{formatTimestamp(log.timestamp)}</span>
                </div>
              </div>
              
              {log.document_url && (
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => window.open(`${API_BASE_URL}${log.document_url}`, '_blank')}
                  title="View Document"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No activity logs found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
