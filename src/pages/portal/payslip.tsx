import { useState } from 'react';
import { Download, TrendingUp, AlertCircle } from 'lucide-react';
import { usePayslips } from '../../hooks/usePayslip';
import PayslipDetailModal from '../../components/portal/PayslipDetailModal';
import StatusBadge from '../../components/ui/StatusBadge';
import type { Payslip } from '../../types/portal.types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

function PayslipSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-28 bg-blue-100 rounded-xl" />
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PayslipPage() {
  const { data: payslips, isLoading, isError, refetch } = usePayslips();
  const [selected, setSelected] = useState<Payslip | null>(null);

  //  sum processed payslips for current financial year (Apr–Mar)
  const processed = payslips?.filter(p => p.status === 'Processed') ?? [];
  const ytd = {
    gross:      processed.reduce((s, p) => s + p.grossPay, 0),
    deductions: processed.reduce((s, p) =>
      s + p.deductions.pfDeduction + p.deductions.esiDeduction + p.deductions.tds, 0),
    net:        processed.reduce((s, p) => s + p.netPay, 0),
  };

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
      <PayslipSkeleton />
    </div>
  );

  if (isError) return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm font-medium text-red-700">Failed to load payslips</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Detail modal */}
      {selected && (
        <PayslipDetailModal
          payslip={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payslip & Compensation</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and download your monthly payslips</p>
      </div>

      {/* YTD Summary card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 opacity-80" />
          <span className="text-sm font-medium opacity-90">
            Year-to-Date Summary · FY 2024–25
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs opacity-70 mb-0.5">Total Gross</p>
            <p className="text-lg font-bold">{fmt(ytd.gross)}</p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-0.5">Total Deductions</p>
            <p className="text-lg font-bold">{fmt(ytd.deductions)}</p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-0.5">Net Take-Home</p>
            <p className="text-lg font-bold">{fmt(ytd.net)}</p>
          </div>
        </div>
      </div>

      {/* Payslip list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Payslip History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {payslips?.map(ps => (
            <div
              key={ps.id}
              onClick={() => ps.status === 'Processed' && setSelected(ps)}
              className={`flex items-center gap-4 px-5 py-4 transition-colors
                ${ps.status === 'Processed'
                  ? 'hover:bg-gray-50 cursor-pointer'
                  : 'opacity-60 cursor-default'
                }`}
            >
              {/* Month icon */}
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 text-xs font-bold">
                  {ps.month.slice(0, 3).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{ps.month}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500">Gross: {fmt(ps.grossPay)}</span>
                  {ps.status === 'Processed' && (
                    <span className="text-xs text-gray-500">Net: {fmt(ps.netPay)}</span>
                  )}
                </div>
              </div>

              {/* ✅ Using shared StatusBadge component from Dev A */}
              <StatusBadge status={ps.status} />

              {/* Download button */}
              {ps.status === 'Processed' && (
                <button
                  onClick={e => { e.stopPropagation(); setSelected(ps); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}