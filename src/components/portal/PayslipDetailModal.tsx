import { X, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../../api/mockInterceptors';
import type { Payslip } from '../../types/portal.types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

const fmtPlain = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

interface Props {
  payslip: Payslip;
  onClose: () => void;
}

export default function PayslipDetailModal({ payslip, onClose }: Props) {
  const totalDeductions =
    payslip.deductions.pfDeduction +
    payslip.deductions.esiDeduction +
    payslip.deductions.tds;

  // calls GET /api/v1/payroll/payslips/{id}/download
  const handleDownload = async () => {
    try {
      await api.get(`/payroll/payslips/${payslip.id}/download`);

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();

      // ── Header band ───────────────────────────────────────────
      doc.setFillColor(37, 99, 235);           // blue-600
      doc.rect(0, 0, W, 64, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Tendworks Private Limited', 40, 28);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Employee Payslip', 40, 48);

      doc.setFontSize(11);
      doc.text(payslip.month, W - 40, 38, { align: 'right' });

      // ── Meta row ──────────────────────────────────────────────
      doc.setTextColor(55, 65, 81);            // gray-700
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Status:', 40, 88);
      doc.setFont('helvetica', 'bold');
      doc.text(payslip.status, 80, 88);

      // ── Section helper ────────────────────────────────────────
      const sectionHeader = (label: string, y: number, color: [number, number, number]) => {
        doc.setFillColor(...color);
        doc.rect(40, y, W - 80, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(label.toUpperCase(), 48, y + 13);
        return y + 20;
      };

      const row = (
        label: string, value: string,
        y: number,
        labelColor: [number, number, number] = [75, 85, 99],
        valueColor: [number, number, number] = [17, 24, 39],
        bold = false,
      ) => {
        doc.setTextColor(...labelColor);
        doc.setFontSize(9);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(label, 48, y);
        doc.setTextColor(...valueColor);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(value, W - 48, y, { align: 'right' });
        // thin divider
        doc.setDrawColor(229, 231, 235);
        doc.line(40, y + 5, W - 40, y + 5);
        return y + 22;
      };

      // ── Earnings ──────────────────────────────────────────────
      let y = 104;
      y = sectionHeader('Earnings', y, [21, 128, 61]);   // green-700
      y += 4;
      y = row('Basic Salary',       `INR ${fmtPlain(payslip.earnings.basic)}`,            y);
      y = row('HRA',                `INR ${fmtPlain(payslip.earnings.hra)}`,              y);
      y = row('Special Allowance',  `INR ${fmtPlain(payslip.earnings.specialAllowance)}`, y);
      y = row(
        'Total Earnings', `INR ${fmtPlain(payslip.grossPay)}`,
        y, [21, 128, 61], [21, 128, 61], true,
      );

      // ── Deductions ────────────────────────────────────────────
      y += 12;
      y = sectionHeader('Deductions', y, [185, 28, 28]);  // red-700
      y += 4;
      y = row('PF Deduction',  `- INR ${fmtPlain(payslip.deductions.pfDeduction)}`,  y);
      y = row('ESI Deduction', `- INR ${fmtPlain(payslip.deductions.esiDeduction)}`, y);
      y = row('TDS',           `- INR ${fmtPlain(payslip.deductions.tds)}`,          y);
      y = row(
        'Total Deductions', `- INR ${fmtPlain(totalDeductions)}`,
        y, [185, 28, 28], [185, 28, 28], true,
      );

      // ── Net Pay band ──────────────────────────────────────────
      y += 16;
      doc.setFillColor(239, 246, 255);         // blue-50
      doc.rect(40, y, W - 80, 36, 'F');
      doc.setDrawColor(191, 219, 254);         // blue-200
      doc.rect(40, y, W - 80, 36, 'S');

      doc.setTextColor(30, 64, 175);           // blue-800
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('NET PAY', 52, y + 23);
      doc.setFontSize(13);
      doc.text(`INR ${fmtPlain(payslip.netPay)}`, W - 52, y + 23, { align: 'right' });

      // ── Footer ────────────────────────────────────────────────
      doc.setTextColor(156, 163, 175);         // gray-400
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'This is a system-generated payslip and does not require a signature.',
        W / 2, 810, { align: 'center' },
      );
      doc.text('Tendworks Private Limited — Confidential', W / 2, 822, { align: 'center' });

      // ── Save ──────────────────────────────────────────────────
      doc.save(`Payslip_${payslip.monthYear}.pdf`);

    } catch {
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Payslip — {payslip.month}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Official payslip breakdown</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Two-column breakdown */}
        <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100 p-5">

          {/* Earnings */}
          <div className="pr-5">
            <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">
              Earnings
            </h4>
            {[
              ['Basic',             payslip.earnings.basic],
              ['HRA',               payslip.earnings.hra],
              ['Special Allowance', payslip.earnings.specialAllowance],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-medium text-gray-800">{fmt(Number(val))}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 mt-1">
              <span className="text-xs font-semibold text-green-700">Total Earnings</span>
              <span className="text-xs font-bold text-green-700">{fmt(payslip.grossPay)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="pl-5">
            <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">
              Deductions
            </h4>
            {[
              ['PF Deduction',  payslip.deductions.pfDeduction],
              ['ESI Deduction', payslip.deductions.esiDeduction],
              ['TDS',           payslip.deductions.tds],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-medium text-red-500">−{fmt(Number(val))}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 mt-1">
              <span className="text-xs font-semibold text-red-600">Total Deductions</span>
              <span className="text-xs font-bold text-red-600">−{fmt(totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Net Pay footer */}
        <div className="flex items-center justify-between px-5 py-4 bg-blue-50 border-t border-blue-100">
          <span className="text-sm font-semibold text-blue-800">Net Pay</span>
          <span className="text-lg font-bold text-blue-700">{fmt(payslip.netPay)}</span>
        </div>

      </div>
    </div>
  );
}