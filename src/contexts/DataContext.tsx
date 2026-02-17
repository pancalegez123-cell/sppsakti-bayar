import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Student, Bill, Payment } from '@/types/spp';
import { mockStudents, mockBills, mockPayments, mockSppSettings } from '@/data/mockData';

interface DataContextType {
  students: Student[];
  bills: Bill[];
  payments: Payment[];
  sppSettings: typeof mockSppSettings;
  // Students
  addStudent: (student: Omit<Student, 'id'>) => void;
  addStudents: (students: Omit<Student, 'id'>[]) => void;
  updateStudent: (id: string, data: Omit<Student, 'id'>) => void;
  deleteStudents: (ids: string[]) => void;
  // Bills
  addBill: (bill: Omit<Bill, 'id'>) => void;
  addBills: (bills: Omit<Bill, 'id'>[]) => void;
  deleteBills: (ids: string[]) => void;
  updateBill: (id: string, data: Partial<Bill>) => void;
  // Payments
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  recordPaymentForBill: (payment: Omit<Payment, 'id'>, billId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  const addStudent = useCallback((student: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...student, id: `s-${Date.now()}` }]);
  }, []);

  const addStudents = useCallback((newStudents: Omit<Student, 'id'>[]) => {
    const withIds = newStudents.map((s, i) => ({ ...s, id: `imp-${Date.now()}-${i}` }));
    setStudents(prev => [...prev, ...withIds]);
  }, []);

  const updateStudent = useCallback((id: string, data: Omit<Student, 'id'>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...data, id } : s));
  }, []);

  const deleteStudents = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setStudents(prev => prev.filter(s => !idSet.has(s.id)));
  }, []);

  const addBill = useCallback((bill: Omit<Bill, 'id'>) => {
    setBills(prev => [{ ...bill, id: `b-${Date.now()}` }, ...prev]);
  }, []);

  const addBills = useCallback((newBills: Omit<Bill, 'id'>[]) => {
    const withIds = newBills.map((b, i) => ({ ...b, id: `b-${Date.now()}-${i}` }));
    setBills(prev => [...withIds, ...prev]);
  }, []);

  const deleteBills = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setBills(prev => prev.filter(b => !idSet.has(b.id)));
  }, []);

  const updateBill = useCallback((id: string, data: Partial<Bill>) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  }, []);

  const addPayment = useCallback((payment: Omit<Payment, 'id'>) => {
    setPayments(prev => [{ ...payment, id: `p-${Date.now()}` }, ...prev]);
  }, []);

  const recordPaymentForBill = useCallback((payment: Omit<Payment, 'id'>, billId: string) => {
    const newPayment: Payment = { ...payment, id: `p-${Date.now()}`, billId };
    setPayments(prev => [newPayment, ...prev]);

    // Update the bill
    setBills(prev => prev.map(b => {
      if (b.id !== billId) return b;
      const newPaidAmount = b.paidAmount + payment.amount;
      const overpayment = Math.max(0, newPaidAmount - b.amount);
      const status = newPaidAmount >= b.amount ? 'lunas' as const : 'belum_lunas' as const;
      return { ...b, paidAmount: newPaidAmount, status, overpayment };
    }));
  }, []);

  return (
    <DataContext.Provider value={{
      students, bills, payments, sppSettings: mockSppSettings,
      addStudent, addStudents, updateStudent, deleteStudents,
      addBill, addBills, deleteBills, updateBill,
      addPayment, recordPaymentForBill,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
