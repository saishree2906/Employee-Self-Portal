
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  children: React.ReactNode;
}

export default function PortalRouteGuard({ children }: Props) {
  const { isAuthenticated, userRole } = useAuthStore();

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // No portal role → go to login
  const allowedRoles = ['Employee', 'Manager', 'HR', 'Admin'];
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
