import { useState } from 'react';
import { apiClient } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function TestLogin() {
  const [email, setEmail] = useState('admin@wealthapp.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const { toast } = useToast();

  const handleLogin = async () => {
    setLoading(true);
    console.log('Attempting login...');
    
    const { data, error } = await apiClient.signIn(email, password);
    
    if (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      console.log('Login success:', data);
      setUser(data.user);
      toast({
        title: 'Login Successful',
        description: `Welcome ${data.user.name}!`
      });
      
      // Fetch goals after login
      fetchGoals();
    }
    
    setLoading(false);
  };

  const fetchGoals = async () => {
    const { data, error } = await apiClient.getGoals();
    if (error) {
      console.error('Goals error:', error);
    } else {
      console.log('Goals:', data);
      setGoals(data);
    }
  };

  const createTestGoal = async () => {
    const goalData = {
      title: 'Test Goal',
      goal_type: 'retirement',
      target_amount: 100000,
      current_amount: 10000,
      monthly_contribution: 1000,
      target_date: '2030-12-31'
    };
    
    const { data, error } = await apiClient.createGoal(goalData);
    if (error) {
      console.error('Create goal error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      console.log('Goal created:', data);
      toast({
        title: 'Success',
        description: 'Goal created successfully!'
      });
      fetchGoals();
    }
  };

  const handleLogout = () => {
    apiClient.signOut();
    setUser(null);
    setGoals([]);
    toast({
      title: 'Logged Out',
      description: 'You have been logged out'
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">API Integration Test</h1>
        
        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>Login Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wealthapp.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Admin:</strong> {user.is_admin}</p>
                </div>
                <Button onClick={handleLogout} variant="outline" className="mt-4">
                  Logout
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goals ({goals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={createTestGoal} className="mb-4">
                  Create Test Goal
                </Button>
                <Button onClick={fetchGoals} variant="outline" className="mb-4 ml-2">
                  Refresh Goals
                </Button>
                
                {goals.length === 0 ? (
                  <p className="text-gray-500">No goals found</p>
                ) : (
                  <div className="space-y-2">
                    {goals.map((goal: any) => (
                      <div key={goal.id} className="p-3 border rounded">
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-gray-600">
                          ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {goal.goal_type} | Target: {goal.target_date}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Backend: http://localhost:8080<br/>
              Check browser console for detailed API logs
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
