
import { useQuery } from '@tanstack/react-query';
import api from '../api/mockInterceptors';
import type { WeekSchedule } from '../types/portal.types';


export function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
}

export function useShifts(selectedWeek: number) {
  return useQuery<WeekSchedule>({
    queryKey: ['shifts', selectedWeek],
    queryFn: async () => {
      const res = await api.get(`/shifts/my-schedule?week=${selectedWeek}`);
      if (!res.data) throw new Error('No shift data returned');
      return res.data;
    },
  });
}