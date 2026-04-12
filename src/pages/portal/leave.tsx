// src/pages/portal/leave.tsx
import { useQueryClient } from '@tanstack/react-query';
import LeaveBalanceWidget   from '../../components/portal/LeaveBalanceWidget';
import LeaveApplicationForm from '../../components/portal/LeaveApplicationForm';
import LeaveHistoryTable    from '../../components/portal/LeaveHistoryTable';

export default function LeavePage() {
  const queryClient = useQueryClient();

  const handleLeaveApplied = () => {
    queryClient.invalidateQueries({ queryKey: ['leave'] });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      <div>
        <h1 className="text-xl font-bold text-gray-900">Leave Self-Service</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Apply for leave, view balances, and track your requests
        </p>
      </div>

      {/* Circular balance rings */}
      <LeaveBalanceWidget />

      {/* Apply form with working-days calc + balance guard */}
      <LeaveApplicationForm onSuccess={handleLeaveApplied} />

      {/* Sortable history table with cancel button */}
      <LeaveHistoryTable />

    </div>
  );
}