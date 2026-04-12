import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LeaveRequest } from '../../types/portal.types';

// ── Color map per leave type ───────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  CL: { bg: 'bg-blue-100',  text: 'text-blue-700',  dot: 'bg-blue-500',  label: 'Casual Leave'  },
  SL: { bg: 'bg-red-100',   text: 'text-red-700',   dot: 'bg-red-500',   label: 'Sick Leave'    },
  EL: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Earned Leave'  },
};

// ── Helpers ────────────────────────────────────────────────────
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  // 0 = Sun → convert to Mon-based (0 = Mon)
  return (new Date(year, month, 1).getDay() + 6) % 7;
}
function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface Props {
  leaveRequests: LeaveRequest[];
}

export default function LeaveCalendar({ leaveRequests }: Props) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());   // 0-based

  // ── Only approved leaves for calendar ─────────────────────
  const approved = useMemo(
    () => leaveRequests.filter(r => r.status === 'Approved'),
    [leaveRequests],
  );

  // ── Build a map: isoDateStr → leaveType ───────────────────
  const markedDates = useMemo(() => {
    const map: Record<string, string> = {};
    for (const req of approved) {
      const start = new Date(req.startDate);
      const end   = new Date(req.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        map[key]  = req.leaveType;
      }
    }
    return map;
  }, [approved]);

  // ── Month navigation ───────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const totalDays   = daysInMonth(viewYear, viewMonth);
  const startOffset = firstDayOfMonth(viewYear, viewMonth);   // Mon=0
  const monthLabel  = new Date(viewYear, viewMonth, 1)
    .toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_HEADERS.map(d => (
          <div
            key={d}
            className={`py-2 text-center text-[10px] font-semibold uppercase tracking-wide ${
              d === 'Sat' || d === 'Sun' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 border-b border-r border-gray-50" />
        ))}

        {/* Day cells */}
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
          const iso       = isoDate(viewYear, viewMonth, day);
          const leaveType = markedDates[iso];
          const color     = leaveType ? TYPE_COLORS[leaveType] : null;
          const isToday   = iso === today.toISOString().slice(0, 10);
          const colIndex  = (startOffset + day - 1) % 7;   // 0=Mon … 6=Sun
          const isWeekend = colIndex === 5 || colIndex === 6;

          return (
            <div
              key={day}
              className={`relative h-10 flex items-center justify-center border-b border-r border-gray-50 ${
                color ? color.bg : ''
              } ${isWeekend && !color ? 'bg-gray-50/60' : ''}`}
            >
              <span
                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday
                    ? 'bg-blue-600 text-white font-bold'
                    : color
                    ? color.text
                    : isWeekend
                    ? 'text-gray-400'
                    : 'text-gray-700'
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-100 flex-wrap">
        {Object.entries(TYPE_COLORS).map(([type, { dot, label }]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-[10px] text-gray-500">{label} ({type})</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-[10px] text-gray-500">Today</span>
        </div>
      </div>
    </div>
  );
}