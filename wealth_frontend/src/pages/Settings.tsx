import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Shield, Bell, Palette, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  // Separate loading states for different actions to prevent UI confusion
  const [profileLoading, setProfileLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // KYC State
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycData, setKycData] = useState({
      full_name: '',
      dob: '',
      document_type: 'pan',
      document_number: '',
      address: ''
  });
  const [kycFile, setKycFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    risk_profile: 'moderate',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [notifications, setNotifications] = useState({
    marketUpdates: true,
    goalMilestones: true,
    portfolioAlerts: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        risk_profile: user.risk_profile || 'moderate',
      });
    }
  }, [user]);

  const riskProfiles = [
    { value: 'conservative', label: 'Conservative', description: 'Lower risk, steady growth' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced risk and reward' },
    { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, higher potential' },
  ];

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setPhotoLoading(true);
    const { data, error } = await apiClient.uploadProfileImage(file);
    setPhotoLoading(false);

    if (error) {
      toast({
        title: "Error uploading photo",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated successfully.",
      });
      
      // Update local storage user
      if (data) {
        updateUser(data);
      }
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure your new password and confirmation match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    
    const { error } = await apiClient.updatePassword({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password
    });

    setPasswordLoading(false);

    if (error) {
       toast({
        title: "Update failed",
        description: (error as any).response?.data?.detail || "Failed to update password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: checked }));
    
    const labels = {
      marketUpdates: "Market Updates",
      goalMilestones: "Goal Milestones",
      portfolioAlerts: "Portfolio Alerts"
    };

    toast({
      title: `${labels[key]} ${checked ? 'enabled' : 'disabled'}`,
      description: `${labels[key]} have been turned ${checked ? 'on' : 'off'}.`,
      duration: 2000,
    });
  };

  const handleKYCSubmit = async () => {
      if (!kycData.full_name || !kycData.dob || !kycData.document_number || !kycData.address) {
          toast({
              title: "Missing fields",
              description: "Please fill in all required fields",
              variant: "destructive"
          });
          return;
      }

      setKycLoading(true);
      const formData = new FormData();
      formData.append('full_name', kycData.full_name);
      formData.append('dob', kycData.dob);
      formData.append('document_type', kycData.document_type);
      formData.append('document_number', kycData.document_number);
      formData.append('address', kycData.address);
      if (kycFile) {
          formData.append('document_proof', kycFile);
      }

      const { data, error } = await apiClient.submitKYC(formData);
      setKycLoading(false);

      if (error) {
          toast({
              title: "KYC Submission Failed",
              description: error.message,
              variant: "destructive"
          });
      } else {
          toast({
              title: "KYC Submitted",
              description: "Your document verification is pending.",
          });
          setKycDialogOpen(false);
          // Refresh user data is needed, or optimistically update
          // Since updateProfile implementation in api.ts doesn't refresh fully, we might need to manually trigger context refresh or just update user object locally if possible
          // But here we rely on page reload or the fact that context usually listens to changes if implemented well. 
          // `updateUser` from useAuth takes a Partial<User> often.
          updateUser({ ...user, kyc_status: 'pending' });
      }
  };

  const handleSave = async (section: 'profile' | 'risk') => {
    if (section === 'profile') setProfileLoading(true);
    else setRiskLoading(true);

    const { data, error } = await apiClient.updateProfile({
      name: formData.name,
      email: formData.email,
      risk_profile: formData.risk_profile,
    });
    
    if (section === 'profile') setProfileLoading(false);
    else setRiskLoading(false);

    if (error) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: section === 'profile' ? "Profile updated" : "Risk profile updated",
        description: "Your changes have been saved successfully.",
      });
      // Update local storage user if needed, or rely on re-fetch
      // Ideally useAuth should expose a method to update user state
      if (data) {
        updateUser(data);
      }
    }
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-2">
              <Shield className="h-4 w-4" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      {user.profile_picture ? (
                        <AvatarImage src={`${API_BASE_URL}${user.profile_picture}`} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <Button variant="outline" size="sm" onClick={handlePhotoClick} disabled={photoLoading}>
                        {photoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Photo"}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('profile')} disabled={profileLoading}>
                    {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>KYC Status</CardTitle>
                  <CardDescription>Identity verification status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      user.kyc_status === 'verified' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                    )}>
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{user.kyc_status || 'Unverified'}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.kyc_status === 'verified' 
                          ? "Your identity has been verified." 
                          : "Please complete verification to unlock all features."}
                      </p>
                    </div>
                    {user.kyc_status !== 'verified' && user.kyc_status !== 'pending' && (
                      <Button variant="outline" size="sm" className="ml-auto" onClick={() => setKycDialogOpen(true)}>
                        Verify
                      </Button>
                    )}
                    {user.kyc_status === 'pending' && (
                        <Badge variant="outline" className="ml-auto bg-yellow-50 text-yellow-600 border-yellow-200">Pending Review</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Profile Tab */}
          <TabsContent value="risk">
            <Card>
              <CardHeader>
                <CardTitle>Risk Profile</CardTitle>
                <CardDescription>
                  Your risk tolerance determines your investment recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {riskProfiles.map((profile) => (
                    <div
                      key={profile.value}
                      className={cn(
                        "cursor-pointer rounded-lg border p-4 hover:border-primary transition-colors",
                        formData.risk_profile === profile.value ? "border-primary bg-primary/5" : ""
                      )}
                      onClick={() => setFormData({...formData, risk_profile: profile.value})}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{profile.label}</span>
                        {formData.risk_profile === profile.value && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.description}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('risk')} disabled={riskLoading}>
                    {riskLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Risk Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your email and push notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Market Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive daily market summaries</p>
                  </div>
                  <Switch 
                    checked={notifications.marketUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('marketUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Goal Milestones</Label>
                    <p className="text-sm text-muted-foreground">Get notified when you reach a goal</p>
                  </div>
                  <Switch 
                    checked={notifications.goalMilestones}
                    onCheckedChange={(checked) => handleNotificationChange('goalMilestones', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Portfolio Alerts</Label>
                    <p className="text-sm text-muted-foreground">Large movement alerts for your holdings</p>
                  </div>
                  <Switch 
                    checked={notifications.portfolioAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('portfolioAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password" 
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input 
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handlePasswordUpdate} 
                  disabled={passwordLoading || !passwordData.current_password || !passwordData.new_password}
                >
                  {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Complete KYC Verification</DialogTitle>
                    <DialogDescription>
                        Submit your details for identity verification.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="kyc-name">Full Name</Label>
                        <Input 
                            id="kyc-name" 
                            value={kycData.full_name}
                            onChange={(e) => setKycData({...kycData, full_name: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="kyc-dob">Date of Birth</Label>
                        <Input 
                            id="kyc-dob" 
                            type="date"
                            value={kycData.dob}
                            onChange={(e) => setKycData({...kycData, dob: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Document Type</Label>
                        <RadioGroup 
                            defaultValue="pan" 
                            value={kycData.document_type}
                            onValueChange={(val) => setKycData({...kycData, document_type: val})}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pan" id="r1" />
                                <Label htmlFor="r1">PAN</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="aadhaar" id="r2" />
                                <Label htmlFor="r2">Aadhaar</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="r3" />
                                <Label htmlFor="r3">Other</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="kyc-doc-num">Document Number</Label>
                        <Input 
                            id="kyc-doc-num" 
                            value={kycData.document_number}
                            onChange={(e) => setKycData({...kycData, document_number: e.target.value})}
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="kyc-address">Address</Label>
                        <Textarea 
                            id="kyc-address" 
                            value={kycData.address}
                            onChange={(e) => setKycData({...kycData, address: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="kyc-file">ID Proof (Optional)</Label>
                        <Input 
                            id="kyc-file" 
                            type="file"
                            onChange={(e) => setKycFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setKycDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleKYCSubmit} disabled={kycLoading}>
                        {kycLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Verification
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Settings;
