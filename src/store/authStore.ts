// store/authStore.ts
// This store is provided by Frontend Developer A.
// We use it to read the current user's role and token.
import { create } from 'zustand';

export type UserRole = 'Employee' | 'Manager' | 'HR' | 'Admin';

interface AuthState {
  token: string | null;
  userRole: UserRole | null;
  userName: string;
  employeeId: string;
  isAuthenticated: boolean;

  // Actions
  login: (token: string, role: UserRole, name: string, id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Hardcoded for Phase 1 (mock login state)
  token: 'mock-token-phase1',
  userRole: 'Employee',
  userName: 'Saishree Rajan',
  employeeId: 'TW-1042',
  isAuthenticated: true,

  login: (token, userRole, userName, employeeId) =>
    set({ token, userRole, userName, employeeId, isAuthenticated: true }),

  logout: () =>
    set({ token: null, userRole: null, userName: '', employeeId: '', isAuthenticated: false }),
}));
