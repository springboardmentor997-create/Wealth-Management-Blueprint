import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';

export function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAdmin, adminLoading } = useAdminAuth();
  const location = useLocation();

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Bypass admin check for development
  // if (!isAdmin) {
  //   return <Navigate to="/admin-login" state={{ from: location }} replace />;
  // }

  return children;
}
