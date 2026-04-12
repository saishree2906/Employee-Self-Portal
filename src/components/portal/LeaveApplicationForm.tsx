import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useLeaveBalance, useApplyLeave } from '../../hooks/useLeave';
import type { LeaveType } from '../../types/portal.types';

const PUBLIC_HOLIDAYS = [
  '2025-01-26',
  '2025-08-15',
  '2025-10-02',
  '2025-10-24',
  '2025-11-01',
];

export function calcWorkingDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    const iso = cur.toISOString().slice(0, 10);
    if (day !== 0 && day !== 6 && !PUBLIC_HOLIDAYS.includes(iso)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

interface Props {
  onSuccess: () => void;
}

export default function LeaveApplicationForm({ onSuccess }: Props) {
  const { data: balances } = useLeaveBalance();
  const applyLeave = useApplyLeave();

  const [leaveType, setLeaveType] = useState<LeaveType>('CL');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [reason,    setReason]    = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const workingDays    = calcWorkingDays(startDate, endDate);
  const currentBalance = balances?.find(b => b.leaveType === leaveType);
  const available      = currentBalance ? currentBalance.total - currentBalance.used : 0;
  const isInsufficient = workingDays > 0 && workingDays > available;
  const canSubmit      = !!(leaveType && startDate && endDate && reason.trim() && workingDays > 0 && !isInsufficient);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await applyLeave.mutateAsync({ leaveType, startDate, endDate, reason });
      setToast({ type: 'success', msg: 'Leave applied successfully!' });
      setStartDate(''); setEndDate(''); setReason(''); setLeaveType('CL');
      setTimeout(() => { setToast(null); onSuccess(); }, 2000);
    } catch {
      setToast({ type: 'error', msg: 'Failed to apply leave. Please try again.' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Apply for Leave</h2>

      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm ${
          toast.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Leave Type */}
        <div>
          <label
            htmlFor="leaveType"
            className="text-xs font-medium text-gray-600 block mb-1"
          >
            Leave Type
          </label>
          <select
            id="leaveType"
            value={leaveType}
            onChange={e => setLeaveType(e.target.value as LeaveType)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="CL">CL — Casual Leave</option>
            <option value="SL">SL — Sick Leave</option>
            <option value="EL">EL — Earned Leave</option>
            <option value="LOP">LOP — Loss of Pay</option>
          </select>
        </div>

        {/* Working Days — auto calculated */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Working Days
          </label>
          <div className={`w-full border rounded-lg px-3 py-2 text-sm ${
            workingDays > 0
              ? isInsufficient
                ? 'bg-red-50 border-red-200 text-red-600 font-medium'
                : 'bg-green-50 border-green-200 text-green-700 font-medium'
              : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}>
            {workingDays > 0
              ? `${workingDays} working day${workingDays > 1 ? 's' : ''}`
              : 'Auto-calculated after selecting dates'}
          </div>
        </div>

        {/* Start Date — htmlFor + id added for tests */}
        <div>
          <label
            htmlFor="startDate"
            className="text-xs font-medium text-gray-600 block mb-1"
          >
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* End Date — htmlFor + id added for tests */}
        <div>
          <label
            htmlFor="endDate"
            className="text-xs font-medium text-gray-600 block mb-1"
          >
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            min={startDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Reason */}
        <div className="sm:col-span-2">
          <label
            htmlFor="reason"
            className="text-xs font-medium text-gray-600 block mb-1"
          >
            Reason
          </label>
          <textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Briefly describe the reason for your leave..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Insufficient balance error */}
      {isInsufficient && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">
            Insufficient {leaveType} balance ({available} day{available !== 1 ? 's' : ''} remaining,{' '}
            {workingDays} day{workingDays > 1 ? 's' : ''} requested)
          </p>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || applyLeave.isPending}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {applyLeave.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {applyLeave.isPending ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </div>
    </div>
  );
}