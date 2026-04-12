

export interface Employee {
  id: string;
  employeeId: string;          // e.g. "TW-1042"
  fullName: string;
  department: string;          // read-only
  designation: string;         // read-only
  salaryBand: string;          // read-only
  dateOfJoining: string;       // ISO date string
  managerName: string;
  workEmail: string;
  phoneNumber: string;         // editable
  emergencyContact: string;    // editable
  currentAddress: string;      // editable
  profilePhotoUrl: string | null;
}

// ─── Leave ──────────────────────────────────────────────────

export type LeaveType = 'CL' | 'SL' | 'EL' | 'LOP';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveBalance {
  leaveType: LeaveType;
  used: number;
  total: number;
}

export interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  startDate: string;           // ISO date string
  endDate: string;             // ISO date string
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  managerNote: string | null;
  appliedOn: string;           // ISO date string
}

// ─── Payslip ────────────────────────────────────────────────

export type PayslipStatus = 'Processed' | 'Pending';

export interface PayslipEarnings {
  basic: number;
  hra: number;
  specialAllowance: number;
}

export interface PayslipDeductions {
  pfDeduction: number;
  esiDeduction: number;
  tds: number;
}

export interface Payslip {
  id: string;
  month: string;               // e.g. "March 2025"
  monthYear: string;           // ISO: "2025-03"
  grossPay: number;
  netPay: number;
  status: PayslipStatus;
  earnings: PayslipEarnings;
  deductions: PayslipDeductions;
}

// ─── Shift Schedule ─────────────────────────────────────────

export type ShiftType = 'Morning' | 'Evening' | 'Night' | 'DayOff' | 'WFH';

export interface ShiftAssignment {
  date: string;                // ISO date string
  shiftName: string;           // e.g. "Morning Shift"
  shiftType: ShiftType;
  startTime: string | null;    // e.g. "06:00" — null for Day Off
  endTime: string | null;      // e.g. "14:00" — null for Day Off
}

export interface WeekSchedule {
  weekLabel: string;           // e.g. "Mar 17 – Mar 23, 2025"
  assignments: ShiftAssignment[];
}


export type NotificationType =
  | 'leave_approved'
  | 'leave_rejected'
  | 'payslip_generated'
  | 'shift_updated'
  | 'review_cycle_opened';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  targetPath: string;
}
