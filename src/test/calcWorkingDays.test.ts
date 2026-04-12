
import { describe, it, expect } from 'vitest';
import { calcWorkingDays } from '../components/portal/LeaveApplicationForm';

describe('calcWorkingDays', () => {

  // ── Same-day selection ──────────────────────────────────────
  it('returns 1 for same-day selection on a weekday', () => {
    // April 17, 2025 is a Thursday
    expect(calcWorkingDays('2025-04-17', '2025-04-17')).toBe(1);
  });

  it('returns 0 for same-day selection on a Saturday', () => {

    expect(calcWorkingDays('2025-04-19', '2025-04-19')).toBe(0);
  });

  it('returns 0 for same-day selection on a Sunday', () => {

    expect(calcWorkingDays('2025-04-20', '2025-04-20')).toBe(0);
  });

  // ── Weekend exclusion ───────────────────────────────────────
  it('excludes Saturdays and Sundays from count', () => {
    // Apri
    expect(calcWorkingDays('2025-04-14', '2025-04-20')).toBe(5);
  });

  it('returns 0 for a full weekend range', () => {

    expect(calcWorkingDays('2025-04-19', '2025-04-20')).toBe(0);
  });

  // ── Public holiday exclusion ────────────────────────────────
  it('excludes public holidays from count', () => {
    // Jan 25 (Sat) + Jan 26 (Sun, Republic Day holiday)
    // Jan 27 (Mon) to Jan 28 (Tue) = 2 working days
    expect(calcWorkingDays('2025-01-27', '2025-01-28')).toBe(2);
  });

  it('returns 0 when the only day is a public holiday', () => {

    expect(calcWorkingDays('2025-08-15', '2025-08-15')).toBe(0);
  });

  it('does not count Republic Day (Jan 26) as a working day', () => {
    // Jan 24 (Fri) + Jan 26 (Republic Day) in range Jan 24–27
    // Jan 24 = 1 working day, Jan 25 = Sat, Jan 26 = holiday, Jan 27 = Mon = 1
    expect(calcWorkingDays('2025-01-24', '2025-01-27')).toBe(2);
  });

  // ── Multi-week range ────────────────────────────────────────
  it('correctly counts 2 full working weeks', () => {
    // Apr 14 (Mon) to Apr 25 (Fri) = 10 working days
    expect(calcWorkingDays('2025-04-14', '2025-04-25')).toBe(10);
  });

  // ── Invalid range ────
  it('returns 0 when end date is before start date', () => {
    expect(calcWorkingDays('2025-04-20', '2025-04-14')).toBe(0);
  });

  it('returns 0 when dates are empty strings', () => {
    expect(calcWorkingDays('', '')).toBe(0);
  });
});