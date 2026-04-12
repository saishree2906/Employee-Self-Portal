import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/mockInterceptors';
import type { LeaveBalance, LeaveRequest, LeaveType } from '../types/portal.types';

const BALANCE_KEY  = ['leave', 'balance'];
const REQUESTS_KEY = ['leave', 'requests'];

export function useLeaveBalance() {
  return useQuery<LeaveBalance[]>({
    queryKey: BALANCE_KEY,
    queryFn: async () => {
      const res = await api.get('/leaves/balance');
      if (!res.data) throw new Error('No balance data returned');
      return res.data;
    },
  });
}

export function useLeaveRequests() {
  return useQuery<LeaveRequest[]>({
    queryKey: REQUESTS_KEY,
    queryFn: async () => {
      const res = await api.get('/leaves/my-requests');
      if (!res.data) throw new Error('No requests data returned');
      return res.data;
    },
  });
}

export interface ApplyLeavePayload {
  leaveType: LeaveType;
  startDate: string;
  endDate:   string;
  reason:    string;
}

export function useApplyLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ApplyLeavePayload) => {
      const res = await api.post('/leaves/apply', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BALANCE_KEY });
      queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leaveId: string) => {
      const res = await api.delete(`/leaves/${leaveId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: BALANCE_KEY });
    },
  });
}