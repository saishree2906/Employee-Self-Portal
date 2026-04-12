import { useState } from 'react';
import { AlertCircle, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { useLeaveRequests, useCancelLeave } from '../../hooks/useLeave';
import type { LeaveRequest } from '../../types/portal.types';


import DataTable   from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-50 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4 px-4 py-3">
          <div className="h-4 w-28 bg-gray-100 rounded" />
          <div className="h-4 w-10 bg-gray-100 rounded" />
          <div className="h-4 w-8  bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

type SortKey = 'startDate' | 'leaveType' | 'status';

function sortRequests(list: LeaveRequest[], key: SortKey, asc: boolean) {
  return [...list].sort((a, b) => {
    const av = String(a[key] ?? '');
    const bv = String(b[key] ?? '');
    return asc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
}

export default function LeaveHistoryTable() {
  const { data: requests, isLoading, isError, refetch } = useLeaveRequests();
  const cancelLeave = useCancelLeave();

  const [sortKey, setSortKey]           = useState<SortKey>('startDate');
  const [sortAsc, setSortAsc]           = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelLeave.mutateAsync(id);
    } finally {
      setCancellingId(null);
    }
  };

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(col)}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
    >
      {label}
      {sortKey === col
        ? sortAsc
          ? <ChevronUp className="w-3 h-3 text-blue-500" />
          : <ChevronDown className="w-3 h-3 text-blue-500" />
        : <ChevronUp className="w-3 h-3 opacity-30" />
      }
    </button>
  );

  const sorted = requests ? sortRequests(requests, sortKey, sortAsc) : [];

  // ✅ Column definitions for shared DataTable
  const columns = [
    {
      key: 'dateRange',
      header: '',
      // Custom sortable header
      render: (req: LeaveRequest) => (
        <span className="text-xs text-gray-700 whitespace-nowrap">
          {new Date(req.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          {req.startDate !== req.endDate && (
            <> – {new Date(req.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
          )}
        </span>
      ),
    },
    {
      key: 'leaveType',
      header: '',
      render: (req: LeaveRequest) => (
        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          {req.leaveType}
        </span>
      ),
    },
    {
      key: 'numberOfDays',
      header: 'Days',
      render: (req: LeaveRequest) => (
        <span className="text-xs text-gray-700">{req.numberOfDays}d</span>
      ),
    },
    {
      key: 'status',
      header: '',
      // ✅ Uses shared StatusBadge component
      render: (req: LeaveRequest) => <StatusBadge status={req.status} />,
    },
    {
      key: 'managerNote',
      header: 'Manager Note',
      render: (req: LeaveRequest) => (
        <span className="text-xs text-gray-500 max-w-[160px] truncate block">
          {req.managerNote ?? '—'}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (req: LeaveRequest) => req.status === 'Pending' ? (
        <button
          onClick={() => handleCancel(req.id)}
          disabled={cancellingId === req.id}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
        >
          {cancellingId === req.id && <Loader2 className="w-3 h-3 animate-spin" />}
          Cancel
        </button>
      ) : null,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

      {/* Header with sort buttons */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">My Leave History</h2>
        {requests && (
          <span className="text-xs text-gray-400">{requests.length} requests</span>
        )}
      </div>

      {/* Sort controls */}
      {!isLoading && !isError && sorted.length > 0 && (
        <div className="flex items-center gap-4 px-5 py-2 border-b border-gray-50 bg-gray-50">
          <span className="text-xs text-gray-400">Sort by:</span>
          <SortBtn col="startDate" label="Date"   />
          <SortBtn col="leaveType" label="Type"   />
          <SortBtn col="status"    label="Status" />
        </div>
      )}

      {isLoading && <TableSkeleton />}

      {isError && (
        <div className="flex items-center gap-3 m-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 flex-1">Failed to load leave history</p>
          <button onClick={() => refetch()} className="text-xs text-red-600 underline">
            Retry
          </button>
        </div>
      )}

      {/* ✅ Shared DataTable renders the rows */}
      {!isLoading && !isError && (
        <DataTable
          columns={columns}
          data={sorted}
          keyField="id"
          emptyText="No leave requests found."
        />
      )}
    </div>
  );
}