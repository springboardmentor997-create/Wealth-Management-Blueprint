import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isAdmin, adminLoading, adminSignIn } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await adminSignIn(loginForm.email, loginForm.password);
    setIsLoading(false);

    if (!error) {
      navigate('/admin');
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Visual Side */}
      <div className="hidden lg:block relative h-full bg-muted">
        <img
          src="/images/wealth-theme.jpg"
          alt="Wealth Management"
          className="absolute inset-0 h-full w-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-destructive/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 p-12 text-white z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Admin Portal</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">System Administration</h2>
          <p className="text-lg text-white/80 max-w-md">
            Manage users, monitor system performance, and oversee the WealthTrack platform.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors absolute top-8 left-8 lg:static lg:mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to user login
          </Link>

          <div className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive lg:hidden">
              <Shield className="h-6 w-6 text-destructive-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-muted-foreground">Enter your admin credentials to continue</p>
          </div>

          <Card className="border-destructive/20 shadow-xl border-0 shadow-none sm:border sm:shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      className="pl-10"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign In as Admin
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
