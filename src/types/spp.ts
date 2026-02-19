export type UserRole = 'admin' | 'bendahara' | 'operator' | 'wali';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Student is defined after Bill below

export interface SppSetting {
  id: string;
  class: string;
  academicYear: string;
  monthlyAmount: number;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  billId?: string;
  month: string;
  year: number;
  amount: number;
  paymentDate: string;
  method: 'cash' | 'transfer';
  notes: string;
  status: 'lunas' | 'belum_lunas';
}

export interface Bill {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  month: string;
  year: number;
  amount: number;
  paidAmount: number;
  status: 'lunas' | 'belum_lunas';
  dueDate: string;
  createdAt: string;
  type: 'spp' | 'lainnya';
  category?: string;
  overpayment?: number;
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  class: string;
  academicYear: string;
  parentName: string;
  phone: string;
  address: string;
  customSppAmount?: number;
}

export interface SchoolInfo {
  name: string;
  npsn: string;
  address: string;
  phone: string;
  email: string;
  principal: string;
  treasurer: string;
  academicYear: string;
  logo?: string;
}

export interface ReceiptHeader {
  line1: string;
  line2: string;
  line3: string;
  footer: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalPaymentsThisMonth: number;
  unpaidStudents: number;
  totalRevenue: number;
}

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const CLASSES = [
  'VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B'
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  bendahara: 'Bendahara',
  operator: 'Operator',
  wali: 'Wali Murid / Siswa',
};
