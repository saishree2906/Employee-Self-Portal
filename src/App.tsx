import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import PortalLayout from './components/PortalLayout';
import LoginPage from './pages/Login';
import PortalIndex from './pages/portal/index';
import ProfilePage from './pages/portal/profile';
import LeavePage from './pages/portal/leave';
import PayslipPage from './pages/portal/payslip';
import ShiftsPage from './pages/portal/shifts';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 2 } },
});

function RequireAuth() {
  const { isAuthenticated, userRole } = useAuthStore();
  const allowedRoles = ['Employee', 'Manager', 'HR', 'Admin'];

  if (!isAuthenticated || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }
  return <PortalLayout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/portal" replace />} />
          <Route path="/portal" element={<RequireAuth />}>
            <Route index element={<PortalIndex />} />
            <Route path="profile"  element={<ProfilePage />} />
            <Route path="leave"    element={<LeavePage />} />
            <Route path="payslip"  element={<PayslipPage />} />
            <Route path="shifts"   element={<ShiftsPage />} />
            <Route path="*" element={<Navigate to="/portal/profile" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}