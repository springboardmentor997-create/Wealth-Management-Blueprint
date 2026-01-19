import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  risk_profile: string;
  kyc_status: string;
  is_admin: string;
  credits: number;
  last_login: string;
  login_count: number;
  created_at: string;
}

export function UsersTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // React Query: Fetch Users
  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await apiClient.getAllUsers();
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 30,
  });

  // React Query: Mutations
  const verifyKYCMutation = useMutation({
    mutationFn: async (user: User) => {
      const { data, error } = await apiClient.updateUser(user.id, { kyc_status: 'verified' });
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['users'], (oldUsers: User[] | undefined) => {
        return oldUsers?.map(u => u.id === updatedUser.id ? updatedUser : u) || [];
      });
      toast({ title: "KYC Verified", description: `${updatedUser.name} has been verified.` });
    },
    onError: (err: Error) => toast({ title: "Verification Failed", description: err.message, variant: "destructive" })
  });

  const editUserMutation = useMutation({
    mutationFn: async (userData: User) => {
      const { data, error } = await apiClient.updateUser(userData.id, {
        name: userData.name,
        email: userData.email,
        kyc_status: userData.kyc_status
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['users'], (oldUsers: User[] | undefined) => {
        return oldUsers?.map(u => u.id === updatedUser.id ? updatedUser : u) || [];
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast({ title: "User Updated", description: "Saved successfully." });
    },
    onError: (err: Error) => toast({ title: "Update Failed", description: err.message, variant: "destructive" })
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await apiClient.deleteUser(userId);
      if (error) throw error;
      return userId;
    },
    onSuccess: (deletedUserId) => {
      queryClient.setQueryData(['users'], (oldUsers: User[] | undefined) => {
        return oldUsers?.filter(u => u.id !== deletedUserId) || [];
      });
      toast({ title: "User Deleted", description: "User permanently removed." });
    },
    onError: (err: Error) => toast({ title: "Delete Failed", description: err.message, variant: "destructive" })
  });

  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      verified: 'default',
      unverified: 'secondary',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  // handlers
  const handleVerifyKYC = (user: User) => {
    if (user?.id) verifyKYCMutation.mutate(user);
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId && confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSaveUser = () => {
    if (editingUser) editUserMutation.mutate(editingUser);
  };

  if (isLoading) {
      return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isError) {
      return <div className="p-8 text-center text-red-500">Error loading users: {(error as Error).message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                if (!user || !user.id) return null; // Defensive check for invalid user data
                return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || 'Unknown'}</TableCell>
                  <TableCell>{user.email || 'No Email'}</TableCell>
                  <TableCell>{getStatusBadge(user.kyc_status || 'unverified')}</TableCell>
                  <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.kyc_status !== 'verified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleVerifyKYC(user)}
                        >
                          Verify KYC
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found matching your search.
          </div>
        )}
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">KYC Status</Label>
                <Select
                  value={editingUser.kyc_status}
                  onValueChange={(value) => 
                    setEditingUser({ ...editingUser, kyc_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-risk">Risk Profile</Label>
                <Select
                  value={editingUser.risk_profile}
                  onValueChange={(value) => 
                    setEditingUser({ ...editingUser, risk_profile: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={editUserMutation.isPending}>
              {editUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
