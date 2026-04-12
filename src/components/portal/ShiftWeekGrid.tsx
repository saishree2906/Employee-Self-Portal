
import type { ShiftAssignment } from '../../types/portal.types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SHIFT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Morning: { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-100'   },
  Evening: { bg: 'bg-amber-50',  text: 'text-amber-800',  border: 'border-amber-100'  },
  Night:   { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-100' },
  DayOff:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100'  },
  WFH:     { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-100'   },
};

// Skeleton
export function ShiftGridSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2 mt-4 animate-pulse">
      {DAYS.map(d => (
        <div key={d} className="flex flex-col gap-1">
          <div className="h-4 bg-gray-100 rounded mx-auto w-8" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

interface Props {
  assignments: ShiftAssignment[];
}

export default function ShiftWeekGrid({ assignments }: Props) {
  return (
    <div className="grid grid-cols-7 gap-2 mt-4">
      {DAYS.map((day, idx) => {
        const shift   = assignments[idx];
        const s       = shift ? (SHIFT_STYLES[shift.shiftType] ?? SHIFT_STYLES['DayOff']) : SHIFT_STYLES['DayOff'];
        const weekend = idx >= 5;

        return (
          <div key={day} className="flex flex-col gap-1">
            {/* Day label */}
            <div className={`text-center ${weekend ? 'opacity-50' : ''}`}>
              <p className="text-xs font-semibold text-gray-500">{day}</p>
              {shift && (
                <p className="text-[10px] text-gray-400">
                  {new Date(shift.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>

            {/* Shift cell */}
            <div className={`
              ${s.bg} ${s.text} border ${s.border}
              rounded-xl p-2 text-center min-h-[80px]
              flex flex-col items-center justify-center gap-1
              ${weekend ? 'opacity-60' : ''}
            `}>
              {shift ? (
                <>
                  <span className="text-[11px] font-semibold leading-tight">
                    {shift.shiftType === 'DayOff' ? 'Day Off' : shift.shiftType}
                  </span>
                  {shift.startTime && (
                    <>
                      <span className="text-[10px] opacity-70">{shift.startTime}</span>
                      <span className="text-[9px] opacity-50">to</span>
                      <span className="text-[10px] opacity-70">{shift.endTime}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-[11px] opacity-50">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}