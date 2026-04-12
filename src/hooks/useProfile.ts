// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/mockInterceptors';
import type { Employee } from '../types/portal.types';

const PROFILE_KEY = ['profile'];

export function useProfile() {
  return useQuery<Employee>({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const res = await api.get('/employees/me');
      // Safety check — throw clearly if data is missing
      if (!res.data) throw new Error('No profile data returned');
      return res.data;
    },
  });
}

type EditableFields = Pick<Employee, 'phoneNumber' | 'emergencyContact' | 'currentAddress'>;

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EditableFields) => {
      const res = await api.patch('/employees/me', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}