
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LeaveApplicationForm from '../components/portal/LeaveApplicationForm';

// ── Mock useLeaveBalance to control balance values ───
vi.mock('../hooks/useLeave', () => ({
  useLeaveBalance: () => ({
    data: [
      { leaveType: 'CL', used: 10, total: 12 }, // only 2 days remaining
      { leaveType: 'SL', used: 1,  total: 6  },
      { leaveType: 'EL', used: 5,  total: 15 },
    ],
  }),
  useApplyLeave: () => ({
    mutateAsync: vi.fn(),
    isPending:   false,
  }),
}));

// ── Helper to wrap component with QueryClient ────
function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LeaveApplicationForm onSuccess={vi.fn()} />
    </QueryClientProvider>
  );
}

describe('LeaveApplicationForm', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Test 1: Submit button disabled by default ──────────────
  it('submit button is disabled when no dates are selected', () => {
    renderForm();
    const button = screen.getByRole('button', { name: /submit leave request/i });
    expect(button).toBeDisabled();
  });

  // ── Test 2: Submit disabled when balance insufficient ──────
  it('submit button is disabled when requested days exceed available balance', async () => {
    const user = userEvent.setup();
    renderForm();

    // Select CL (only 2 days remaining)
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'CL');

    // Select 5 days (more than the 2 available)
    const startInput = screen.getByLabelText(/start date/i);
    const endInput   = screen.getByLabelText(/end date/i);
    await user.type(startInput, '2025-04-14'); // Monday
    await user.type(endInput,   '2025-04-18'); // Friday = 5 working days

    // Fill reason
    const textarea = screen.getByPlaceholderText(/briefly describe/i);
    await user.type(textarea, 'Family trip');

    // Submit button should still be disabled
    const button = screen.getByRole('button', { name: /submit leave request/i });
    expect(button).toBeDisabled();
  });

  // ── Test 3: Insufficient balance error message shown ───────
  it('shows insufficient balance error message', async () => {
    const user = userEvent.setup();
    renderForm();

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'CL');

    const startInput = screen.getByLabelText(/start date/i);
    const endInput   = screen.getByLabelText(/end date/i);
    await user.type(startInput, '2025-04-14');
    await user.type(endInput,   '2025-04-18');

    // Error message should appear
    expect(
      screen.getByText(/insufficient cl balance/i)
    ).toBeInTheDocument();
  });

  // ── Test 4: Submit enabled when balance is sufficient ──
  it('submit button is enabled when requested days are within balance', async () => {
    const user = userEvent.setup();
    renderForm();

    // Select EL (10 days remaining)
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'EL');

    // Select 1 day only
    const startInput = screen.getByLabelText(/start date/i);
    const endInput   = screen.getByLabelText(/end date/i);
    await user.type(startInput, '2025-04-17'); // Thursday
    await user.type(endInput,   '2025-04-17'); // same day = 1 day

    const textarea = screen.getByPlaceholderText(/briefly describe/i);
    await user.type(textarea, 'Personal work');

    const button = screen.getByRole('button', { name: /submit leave request/i });
    expect(button).not.toBeDisabled();
  });

  // ── Test 5: Form renders correctly ───
  it('renders all form fields', () => {
    renderForm();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/briefly describe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit leave request/i })).toBeInTheDocument();
  });
});