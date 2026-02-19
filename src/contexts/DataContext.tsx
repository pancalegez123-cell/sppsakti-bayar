import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Student, Bill, Payment, SchoolInfo, ReceiptHeader, CLASSES } from '@/types/spp';
import { mockStudents, mockBills, mockPayments, mockSppSettings } from '@/data/mockData';

const defaultSchoolInfo: SchoolInfo = {
  name: 'SMP Negeri 1 Contoh',
  npsn: '12345678',
  address: 'Jl. Pendidikan No. 1, Kota Contoh, Jawa Barat 40100',
  phone: '022-1234567',
  email: 'info@smpn1contoh.sch.id',
  principal: 'Drs. Ahmad Sudrajat, M.Pd.',
  treasurer: 'Siti Nurhaliza, S.Pd.',
  academicYear: '2024/2025',
};

const defaultReceiptHeader: ReceiptHeader = {
  line1: 'YAYASAN PENDIDIKAN CONTOH',
  line2: 'SMP NEGERI 1 CONTOH',
  line3: 'Jl. Pendidikan No. 1, Kota Contoh | Telp. 022-1234567',
  footer: 'Kwitansi ini sah tanpa tanda tangan basah',
};

interface DataContextType {
  students: Student[];
  bills: Bill[];
  payments: Payment[];
  sppSettings: typeof mockSppSettings;
  schoolInfo: SchoolInfo;
  receiptHeader: ReceiptHeader;
  classes: string[];
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
  // School & Receipt
  updateSchoolInfo: (info: SchoolInfo) => void;
  updateReceiptHeader: (header: ReceiptHeader) => void;
  addClass: (name: string) => void;
  deleteClass: (name: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(defaultSchoolInfo);
  const [receiptHeader, setReceiptHeader] = useState<ReceiptHeader>(defaultReceiptHeader);
  const [classes, setClasses] = useState<string[]>([...CLASSES]);

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
    setBills(prev => prev.map(b => {
      if (b.id !== billId) return b;
      const newPaidAmount = b.paidAmount + payment.amount;
      const overpayment = Math.max(0, newPaidAmount - b.amount);
      const status = newPaidAmount >= b.amount ? 'lunas' as const : 'belum_lunas' as const;
      return { ...b, paidAmount: newPaidAmount, status, overpayment };
    }));
  }, []);

  const updateSchoolInfo = useCallback((info: SchoolInfo) => setSchoolInfo(info), []);
  const updateReceiptHeader = useCallback((header: ReceiptHeader) => setReceiptHeader(header), []);
  const addClass = useCallback((name: string) => setClasses(prev => prev.includes(name) ? prev : [...prev, name]), []);
  const deleteClass = useCallback((name: string) => setClasses(prev => prev.filter(c => c !== name)), []);

  return (
    <DataContext.Provider value={{
      students, bills, payments, sppSettings: mockSppSettings,
      schoolInfo, receiptHeader, classes,
      addStudent, addStudents, updateStudent, deleteStudents,
      addBill, addBills, deleteBills, updateBill,
      addPayment, recordPaymentForBill,
      updateSchoolInfo, updateReceiptHeader, addClass, deleteClass,
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
