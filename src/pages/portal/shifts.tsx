import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, WifiOff } from 'lucide-react';
import api from '../../api/mockInterceptors';
import ShiftWeekGrid from '../../components/portal/ShiftWeekGrid';
import type { WeekSchedule } from '../../types/portal.types';

/** Returns the ISO week number (1-53) for a given date */
function getISOWeek(date: Date): number {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return 1 + Math.round(
    ((tmp.getTime() - week1.getTime()) / 86_400_000 - 3 + ((week1.getDay() + 6) % 7)) / 7
  );
}

/** Returns the Monday date of a given ISO week + year */
function mondayOfISOWeek(week: number, year: number): Date {
  const jan4   = new Date(year, 0, 4);
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  monday.setDate(monday.getDate() + (week - 1) * 7);
  return monday;
}

function formatWeekLabel(week: number, year: number): string {
  const mon = mondayOfISOWeek(week, year);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

export default function ShiftsPage() {
  const todayDate = new Date();
  const todayWeek = getISOWeek(todayDate);
  const todayYear = todayDate.getFullYear();
  const MAX_AHEAD = 4;

  const [selectedWeek, setSelectedWeek] = useState(todayWeek);
  const [selectedYear, setSelectedYear] = useState(todayYear);
  const [isOffline,    setIsOffline]    = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  
  const { data, isLoading, isError, refetch } = useQuery<WeekSchedule>({
    queryKey: ['shifts', selectedYear, selectedWeek],
    queryFn: async () => {
      const { data } = await api.get(
        `/shifts/my-schedule?week=${selectedYear}-W${String(selectedWeek).padStart(2, '0')}`
      );
      return data;
    },
    staleTime: 5 * 60_000,
  });

  const weekDelta = (selectedYear - todayYear) * 52 + (selectedWeek - todayWeek);

  const goPrev = () => {
    if (selectedWeek === 1) {
      setSelectedYear(y => y - 1);
      setSelectedWeek(52);
    } else {
      setSelectedWeek(w => w - 1);
    }
  };

  const goNext = () => {
    if (weekDelta >= MAX_AHEAD) return;
    if (selectedWeek === 52) {
      setSelectedYear(y => y + 1);
      setSelectedWeek(1);
    } else {
      setSelectedWeek(w => w + 1);
    }
  };

  const isAtMaxAhead = weekDelta >= MAX_AHEAD;
  const weekLabel    = formatWeekLabel(selectedWeek, selectedYear);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">


      {isOffline && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>You are offline. Showing cached schedule.</span>
        </div>
      )}

      {/* Header + Week navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">My Shift Schedule</h1>
          <p className="text-xs text-gray-400 mt-0.5">View your weekly assignments</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-gray-700 min-w-[180px] text-center">
            {weekLabel}
          </span>

          <button
            onClick={goNext}
            disabled={isAtMaxAhead}
            className={`p-1.5 rounded-lg border border-gray-200 transition-colors ${
              isAtMaxAhead
                ? 'opacity-40 cursor-not-allowed bg-gray-50'
                : 'hover:bg-gray-50 text-gray-600'
            }`}
            aria-label="Next week"
            title={isAtMaxAhead ? 'Cannot view more than 4 weeks ahead' : ''}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Jump to current week */}
          {weekDelta !== 0 && (
            <button
              onClick={() => { setSelectedWeek(todayWeek); setSelectedYear(todayYear); }}
              className="px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Shift grid */}
      {isLoading && (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          Loading schedule…
        </div>
      )}

      {isError && (
        <div className="h-48 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-500">Failed to load schedule.</p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {data && !isLoading && (
        <ShiftWeekGrid assignments={data.assignments} />
      )}

      {/* Colour legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {[
          { label: 'Morning', bg: 'bg-blue-100',   text: 'text-blue-700'   },
          { label: 'Evening', bg: 'bg-amber-100',  text: 'text-amber-700'  },
          { label: 'Night',   bg: 'bg-purple-100', text: 'text-purple-700' },
          { label: 'Day Off', bg: 'bg-green-100',  text: 'text-green-700'  },
        ].map(({ label, bg, text }) => (
          <span
            key={label}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${bg} ${text}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}