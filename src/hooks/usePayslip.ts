
import { useQuery } from '@tanstack/react-query';
import api from '../api/mockInterceptors';
import type { Payslip } from '../types/portal.types';

const PAYSLIPS_KEY = ['payslips'];

export function usePayslips() {
  return useQuery<Payslip[]>({
    queryKey: PAYSLIPS_KEY,
    queryFn: async () => {
      const res = await api.get('/payroll/payslips');
      if (!res.data) throw new Error('No payslip data returned');
      return res.data;
    },
  });
}