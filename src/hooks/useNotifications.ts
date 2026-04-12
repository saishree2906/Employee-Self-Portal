import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';          
import api from '../api/mockInterceptors';
import type { Notification } from '../types/portal.types';

const NOTIF_KEY = ['notifications'];


export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: NOTIF_KEY,
    queryFn: async () => {
      const res = await api.get('/notifications');
      if (!res.data) throw new Error('No notifications returned');
      return res.data;
    },
    refetchInterval: 60000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/notifications/${id}/read`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIF_KEY });
    },
  });
}


export const useMarkRead = useMarkAsRead;


export function useUnreadCount(): number {
  const { data } = useNotifications();
  return data?.filter(n => !n.isRead).length ?? 0;
}


export function useNotificationActions() {
  const navigate = useNavigate();
  const markRead = useMarkAsRead();

  const handleClick = (notif: Notification) => {
    markRead.mutate(notif.id);
    navigate(notif.targetPath);
  };

  return { handleClick };
}