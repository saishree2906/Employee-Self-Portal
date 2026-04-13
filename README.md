# Employee Self-Service Portal
### Tendworks Private Limited — Next-Gen HRMS Intelligence Initiative


---

## Overview

A fully responsive React + TypeScript Employee Self-Service Portal built as part of the Tendworks HRMS platform. Employees can independently manage their HR activities — viewing and editing their profile, applying for leave, downloading payslips, checking shift schedules, and receiving real-time notifications — without needing to contact HR directly.

---

## Features

### F1 — My Profile
- View all employee details (name, department, designation, manager, email)
- Edit restricted fields: phone number, emergency contact, current address
- Profile photo upload with drag-and-drop crop (react-image-crop)
- Read-only fields visually distinguished with tooltip

### F2 — Leave Self-Service
- Leave balance widget with circular progress rings (CL / SL / EL)
- Apply leave form with auto working-days calculation (excludes weekends + public holidays)
- Submit button disabled with inline error when balance is insufficient
- Leave history table with status badges (Pending / Approved / Rejected)
- Cancel pending leave requests
- Monthly leave calendar with colour-coded approved leaves (CL=blue, SL=red, EL=green)

### F3 — Payslip & Compensation
- Payslip card list sorted by most recent month
- Payslip detail modal with two-column earnings/deductions breakdown
- Download PDF button — generates a formatted payslip PDF (jsPDF)
- Year-to-Date summary card (Apr–Mar financial year, client-side aggregation)

### F4 — My Shift Schedule
- 7-column weekly grid (Mon–Sun) with colour-coded shift types
  - Morning = blue, Evening = amber, Night = purple, Day Off = green
- Previous/Next week navigation (capped at 4 weeks ahead)
- Offline banner when network is unavailable (PWA cached schedule)

### F5 — Notifications Centre
- Bell icon with real-time unread count badge
- Notification panel with type icons, relative timestamps, mark-as-read
- Mark all as read button
- Click navigates to relevant portal page
- 60-second polling via TanStack Query `refetchInterval`

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| PDF Generation | jsPDF |
| Image Crop | react-image-crop |
| PWA | vite-plugin-pwa + Workbox |
| State | Zustand |
| Testing | Vitest + React Testing Library |

---

## Project Structure

src/
├── api/
│   └── mockInterceptors.ts       # Axios mock adapter for all endpoints
├── components/
│   ├── PortalLayout.tsx          # Sidebar + header with notification bell
│   ├── portal/
│   │   ├── LeaveApplicationForm.tsx
│   │   ├── LeaveBalanceWidget.tsx
│   │   ├── LeaveCalendar.tsx
│   │   ├── LeaveHistoryTable.tsx
│   │   ├── NotificationPanel.tsx
│   │   ├── PayslipDetailModal.tsx
│   │   ├── ProfileEditForm.tsx
│   │   ├── ShiftWeekGrid.tsx
│   │   └── AvatarCropModal.tsx
│   └── ui/
│       ├── DataTable.tsx
│       └── StatusBadge.tsx
├── hooks/
│   ├── useLeave.ts
│   ├── useNotifications.ts
│   ├── usePayslip.ts
│   ├── useProfile.ts
│   └── useShifts.ts
├── pages/portal/
│   ├── profile.tsx
│   ├── leave.tsx
│   ├── payslip.tsx
│   └── shifts.tsx
├── test/
│   ├── calcWorkingDays.test.ts
│   ├── LeaveApplicationForm.test.tsx
│   └── setup.ts
└── types/
└── portal.types.ts


---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npx vitest run

# Production build
npm run build
```

---

## API Endpoints Consumed

All endpoints are currently mocked via Axios interceptors. Ready for real API swap.

| Method | Endpoint | Feature |
|---|---|---|
| GET | `/api/v1/employees/me` | My Profile |
| PATCH | `/api/v1/employees/me` | Edit Profile |
| POST | `/api/v1/employees/me/avatar` | Upload Photo |
| GET | `/api/v1/leaves/balance` | Leave Balances |
| GET | `/api/v1/leaves/my-requests` | Leave History |
| POST | `/api/v1/leaves/apply` | Apply Leave |
| DELETE | `/api/v1/leaves/{id}` | Cancel Leave |
| GET | `/api/v1/payroll/payslips` | Payslip List |
| GET | `/api/v1/payroll/payslips/{id}/download` | Download PDF |
| GET | `/api/v1/shifts/my-schedule` | Shift Schedule |
| GET | `/api/v1/notifications` | Notifications |
| PATCH | `/api/v1/notifications/{id}/read` | Mark Read |

---

## Tests

```bash
npx vitest run

# Output:
# ✓ src/test/calcWorkingDays.test.ts        (11 tests)
# ✓ src/test/LeaveApplicationForm.test.tsx  (5 tests)
# Test Files  2 passed (2)
# Tests       16 passed (16)
```

### Test Coverage
- **calcWorkingDays** — same-day selection, weekend exclusion, public holiday exclusion, multi-week range, invalid range
- **LeaveApplicationForm** — submit disabled when balance insufficient, inline error message, enabled when within balance

---

## Acceptance Criteria Status

| # | Criterion | Status |
| 1 | Mobile Responsiveness — all pages usable at 375px | ✅ |
| 2 | Leave Logic — working days excludes weekends + 5 public holidays | ✅ |
| 3 | Balance Guard — submit disabled with inline error | ✅ |
| 4 | Offline PWA — shift schedule loads from cache when offline | ✅ |
| 5 | Type Safety — zero TypeScript errors in strict mode | ✅ |
| 6 | Component Reuse — no custom Button/Input/Modal primitives | ✅ |
| 7 | Error Handling — every API call has visible error state + retry | ✅ |
| 8 | Demo Ready — login → apply leave → view payslip → check shift | ✅ |

---

