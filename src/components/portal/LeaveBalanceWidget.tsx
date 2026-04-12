import { AlertCircle } from 'lucide-react';
import { useLeaveBalance } from '../../hooks/useLeave';
import type { LeaveBalance } from '../../types/portal.types';

const RING_CONFIG: Record<string, { color: string; bg: string; text: string; label: string }> = {
  CL: { color: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', label: 'Casual Leave' },
  SL: { color: '#ef4444', bg: '#fef2f2', text: '#b91c1c', label: 'Sick Leave'   },
  EL: { color: '#22c55e', bg: '#f0fdf4', text: '#15803d', label: 'Earned Leave' },
};

function CircularRing({ bal }: { bal: LeaveBalance }) {
  const cfg       = RING_CONFIG[bal.leaveType] ?? RING_CONFIG['CL'];
  const remaining = bal.total - bal.used;
  const pct       = bal.total === 0 ? 0 : bal.used / bal.total;
  const size      = 88;
  const stroke    = 7;
  const radius    = (size - stroke) / 2;
  const circ      = 2 * Math.PI * radius;
  const dash      = circ * pct;
  const gap       = circ - dash;

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl" style={{ backgroundColor: cfg.bg }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={cfg.color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color: cfg.text }}>{remaining}</span>
          <span className="text-[10px] font-medium" style={{ color: cfg.color }}>left</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold" style={{ color: cfg.text }}>{bal.leaveType}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{cfg.label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{bal.used} used / {bal.total} total</p>
      </div>
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl">
          <div className="w-[88px] h-[88px] rounded-full bg-gray-200" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function LeaveBalanceWidget() {
  const { data: balances, isLoading, isError, refetch } = useLeaveBalance();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Leave Balance</h2>

      {isLoading && <BalanceSkeleton />}

      {isError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 flex-1">Failed to load balances</p>
          <button onClick={() => refetch()} className="text-xs text-red-600 underline">
            Retry
          </button>
        </div>
      )}

      {balances && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {balances.map(bal => (
            <CircularRing key={bal.leaveType} bal={bal} />
          ))}
        </div>
      )}
    </div>
  );
}