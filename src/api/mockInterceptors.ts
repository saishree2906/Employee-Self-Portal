import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1' });

// ─── Mock Data ────────────────────────────────────────────────

const MOCK_EMPLOYEE = {
  id: 'emp-001', employeeId: 'TW-1042', fullName: 'Saishree',
  department: 'Engineering', designation: 'React & Python Developer',
  salaryBand: 'L3', dateOfJoining: '2023-06-15', managerName: 'Abi',
  workEmail: 'saishree@tendworks.com', phoneNumber: '+91 9123456789',
  emergencyContact: 'Raju — +91 9987654321',
  currentAddress: '123,2nd street,Nehru nagar,Chennai,Tamil Nadu,India',
  profilePhotoUrl: null,
};

const MOCK_LEAVE_BALANCES = [
  { leaveType: 'CL', used: 3, total: 12 },
  { leaveType: 'SL', used: 1, total: 6  },
  { leaveType: 'EL', used: 5, total: 15 },
];

const MOCK_LEAVE_REQUESTS = [
  { id: 'lr-001', leaveType: 'CL', startDate: '2025-04-14', endDate: '2025-04-15', numberOfDays: 2, reason: 'Personal work',   status: 'Approved', managerNote: 'Approved. Enjoy!',          appliedOn: '2025-04-08' },
  { id: 'lr-002', leaveType: 'SL', startDate: '2025-04-05', endDate: '2025-04-05', numberOfDays: 1, reason: 'Not feeling well', status: 'Rejected', managerNote: 'Team sprint — critical week', appliedOn: '2025-04-04' },
  { id: 'lr-003', leaveType: 'EL', startDate: '2025-05-10', endDate: '2025-05-14', numberOfDays: 3, reason: 'Family trip',      status: 'Pending',  managerNote: null,                         appliedOn: '2025-04-10' },
  { id: 'lr-004', leaveType: 'CL', startDate: '2025-03-20', endDate: '2025-03-21', numberOfDays: 2, reason: 'Festival',        status: 'Approved', managerNote: 'Approved',                   appliedOn: '2025-03-15' },
  { id: 'lr-005', leaveType: 'SL', startDate: '2025-04-22', endDate: '2025-04-22', numberOfDays: 1, reason: 'Medical',         status: 'Approved', managerNote: 'Take care',                  appliedOn: '2025-04-21' },
];

const MOCK_PAYSLIPS = [
  {
    id: 'ps-001', month: 'March 2025',    monthYear: '2025-03',
    grossPay: 85000, netPay: 71250, status: 'Processed',
    earnings:   { basic: 42500, hra: 17000, specialAllowance: 25500 },
    deductions: { pfDeduction: 5100, esiDeduction: 638, tds: 8012 },
  },
  {
    id: 'ps-002', month: 'February 2025', monthYear: '2025-02',
    grossPay: 85000, netPay: 71250, status: 'Processed',
    earnings:   { basic: 42500, hra: 17000, specialAllowance: 25500 },
    deductions: { pfDeduction: 5100, esiDeduction: 638, tds: 8012 },
  },
  {
    id: 'ps-003', month: 'January 2025',  monthYear: '2025-01',
    grossPay: 85000, netPay: 71250, status: 'Processed',
    earnings:   { basic: 42500, hra: 17000, specialAllowance: 25500 },
    deductions: { pfDeduction: 5100, esiDeduction: 638, tds: 8012 },
  },
  {
    id: 'ps-004', month: 'April 2025',    monthYear: '2025-04',
    grossPay: 85000, netPay: 0, status: 'Pending',
    earnings:   { basic: 0, hra: 0, specialAllowance: 0 },
    deductions: { pfDeduction: 0, esiDeduction: 0, tds: 0 },
  },
];

const MOCK_SHIFT_SCHEDULE = {
  weekLabel: 'Apr 14 – Apr 20, 2025',
  assignments: [
    { date: '2025-04-14', shiftName: 'Morning Shift', shiftType: 'Morning', startTime: '06:00', endTime: '14:00' },
    { date: '2025-04-15', shiftName: 'Morning Shift', shiftType: 'Morning', startTime: '06:00', endTime: '14:00' },
    { date: '2025-04-16', shiftName: 'Evening Shift', shiftType: 'Evening', startTime: '14:00', endTime: '22:00' },
    { date: '2025-04-17', shiftName: 'Evening Shift', shiftType: 'Evening', startTime: '14:00', endTime: '22:00' },
    { date: '2025-04-18', shiftName: 'Night Shift',   shiftType: 'Night',   startTime: '22:00', endTime: '06:00' },
    { date: '2025-04-19', shiftName: 'Day Off',       shiftType: 'DayOff',  startTime: null,    endTime: null    },
    { date: '2025-04-20', shiftName: 'Day Off',       shiftType: 'DayOff',  startTime: null,    endTime: null    },
  ],
};

// ── NEW: Notifications mock data ───────────────────────────────
let MOCK_NOTIFICATIONS = [
  {
    id: 'notif-001',
    type: 'leave_approved',
    title: 'Leave Approved',
    message: 'Your CL request for Apr 14–15 has been approved.',
    isRead: false,
    createdAt: '2025-04-09T10:30:00Z',
    targetPath: '/portal/leave',
  },
  {
    id: 'notif-002',
    type: 'payslip_generated',
    title: 'Payslip Generated',
    message: 'Your payslip for March 2025 is now available.',
    isRead: false,
    createdAt: '2025-04-05T09:00:00Z',
    targetPath: '/portal/payslip',
  },
  {
    id: 'notif-003',
    type: 'leave_rejected',
    title: 'Leave Rejected',
    message: 'Your SL request for Apr 5 was rejected. Reason: Team sprint.',
    isRead: true,
    createdAt: '2025-04-04T16:45:00Z',
    targetPath: '/portal/leave',
  },
  {
    id: 'notif-004',
    type: 'shift_updated',
    title: 'Shift Updated',
    message: 'Your shift for Apr 18 has been updated to Night Shift.',
    isRead: false,
    createdAt: '2025-04-03T08:00:00Z',
    targetPath: '/portal/shifts',
  },
  {
    id: 'notif-005',
    type: 'review_cycle',
    title: 'Performance Review Open',
    message: 'Q1 2025 performance review cycle is now open. Submit by Apr 30.',
    isRead: true,
    createdAt: '2025-04-01T09:00:00Z',
    targetPath: '/portal/profile',
  },
];

// ─── Delay helper ─────────────────────────────────────────────

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Mock Adapter ─────────────────────────────────────────────

api.defaults.adapter = async (config) => {
  await delay(600);
  const method = config.method?.toLowerCase();
  const url    = config.url ?? '';

  // ── Employee ──────────────────────────────────────────────
  if (method === 'get' && url === '/employees/me')
    return { data: MOCK_EMPLOYEE, status: 200, statusText: 'OK', headers: {}, config };

  if (method === 'patch' && url === '/employees/me') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data ?? {});
    return { data: { ...MOCK_EMPLOYEE, ...body }, status: 200, statusText: 'OK', headers: {}, config };
  }

  if (method === 'post' && url === '/employees/me/avatar') {
    const formData = config.data as FormData;
    const blob     = formData.get('avatar') as Blob;
    const dataUrl  = await new Promise<string>((resolve) => {
      const reader  = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    return { data: { profilePhotoUrl: dataUrl }, status: 200, statusText: 'OK', headers: {}, config };
  }

  // ── Leave ─────────────────────────────────────────────────
  if (method === 'get' && url === '/leaves/balance')
    return { data: MOCK_LEAVE_BALANCES, status: 200, statusText: 'OK', headers: {}, config };

  if (method === 'get' && url === '/leaves/my-requests')
    return { data: MOCK_LEAVE_REQUESTS, status: 200, statusText: 'OK', headers: {}, config };

  if (method === 'post' && url === '/leaves/apply')
    return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };

  if (method === 'delete' && url.startsWith('/leaves/'))
    return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };

  // ── Payslip ───────────────────────────────────────────────
  if (method === 'get' && url === '/payroll/payslips')
    return { data: MOCK_PAYSLIPS, status: 200, statusText: 'OK', headers: {}, config };

  if (method === 'get' && url.startsWith('/payroll/payslips/') && url.endsWith('/download'))
    return { data: { downloadUrl: '#mock-pdf' }, status: 200, statusText: 'OK', headers: {}, config };

  // ── Shifts ────────────────────────────────────────────────
  if (method === 'get' && url.startsWith('/shifts/my-schedule'))
    return { data: MOCK_SHIFT_SCHEDULE, status: 200, statusText: 'OK', headers: {}, config };

  // ── Notifications ─────────────────────────────────────────
  // GET /api/v1/notifications
  if (method === 'get' && url === '/notifications')
    return { data: MOCK_NOTIFICATIONS, status: 200, statusText: 'OK', headers: {}, config };

  // PATCH /api/v1/notifications/{id}/read
  if (method === 'patch' && url.match(/^\/notifications\/[^/]+\/read$/)) {
    const id = url.split('/')[2];
    MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
  }

  // ── Fallback ──────────────────────────────────────────────
  throw new Error(`Mock: no handler for ${method?.toUpperCase()} ${url}`);
};

export default api;