import { Student, Payment, SppSetting, DashboardStats, Bill } from '@/types/spp';

export const mockStudents: Student[] = [
  { id: '1', name: 'Ahmad Rizki Pratama', nis: '2024001', class: 'VII-A', academicYear: '2024/2025', parentName: 'Budi Pratama', phone: '081234567890', address: 'Jl. Merdeka No. 10, Jakarta' },
  { id: '2', name: 'Siti Nurhaliza', nis: '2024002', class: 'VII-A', academicYear: '2024/2025', parentName: 'Hasan Abdullah', phone: '081234567891', address: 'Jl. Sudirman No. 25, Jakarta' },
  { id: '3', name: 'Muhammad Fauzan', nis: '2024003', class: 'VII-B', academicYear: '2024/2025', parentName: 'Rahmat Hidayat', phone: '081234567892', address: 'Jl. Gatot Subroto No. 5, Jakarta', customSppAmount: 200000 },
  { id: '4', name: 'Dewi Safitri', nis: '2024004', class: 'VIII-A', academicYear: '2024/2025', parentName: 'Agus Safitri', phone: '081234567893', address: 'Jl. Thamrin No. 15, Jakarta' },
  { id: '5', name: 'Rizal Mahendra', nis: '2024005', class: 'VIII-B', academicYear: '2024/2025', parentName: 'Dedi Mahendra', phone: '081234567894', address: 'Jl. Kuningan No. 8, Jakarta' },
  { id: '6', name: 'Putri Amelia', nis: '2024006', class: 'IX-A', academicYear: '2024/2025', parentName: 'Suparjo Amelia', phone: '081234567895', address: 'Jl. Rasuna Said No. 30, Jakarta', customSppAmount: 300000 },
];

export const mockPayments: Payment[] = [
  { id: '1', studentId: '1', studentName: 'Ahmad Rizki Pratama', billId: 'b1', month: 'Januari', year: 2025, amount: 350000, paymentDate: '2025-01-10', method: 'transfer', notes: '', status: 'lunas' },
  { id: '2', studentId: '1', studentName: 'Ahmad Rizki Pratama', billId: 'b2', month: 'Februari', year: 2025, amount: 350000, paymentDate: '2025-02-08', method: 'cash', notes: '', status: 'lunas' },
  { id: '3', studentId: '2', studentName: 'Siti Nurhaliza', billId: 'b3', month: 'Januari', year: 2025, amount: 350000, paymentDate: '2025-01-15', method: 'transfer', notes: '', status: 'lunas' },
  { id: '4', studentId: '3', studentName: 'Muhammad Fauzan', billId: 'b5', month: 'Januari', year: 2025, amount: 200000, paymentDate: '2025-01-20', method: 'cash', notes: 'Bayar sebagian', status: 'belum_lunas' },
  { id: '5', studentId: '4', studentName: 'Dewi Safitri', billId: 'b7', month: 'Januari', year: 2025, amount: 375000, paymentDate: '2025-01-12', method: 'transfer', notes: '', status: 'lunas' },
  { id: '6', studentId: '5', studentName: 'Rizal Mahendra', billId: 'b9', month: 'Januari', year: 2025, amount: 375000, paymentDate: '2025-01-18', method: 'cash', notes: '', status: 'lunas' },
];

export const mockBills: Bill[] = [
  { id: 'b1', studentId: '1', studentName: 'Ahmad Rizki Pratama', title: 'SPP Januari 2025', month: 'Januari', year: 2025, amount: 350000, paidAmount: 350000, status: 'lunas', dueDate: '2025-01-31', createdAt: '2025-01-01', type: 'spp' },
  { id: 'b2', studentId: '1', studentName: 'Ahmad Rizki Pratama', title: 'SPP Februari 2025', month: 'Februari', year: 2025, amount: 350000, paidAmount: 350000, status: 'lunas', dueDate: '2025-02-28', createdAt: '2025-02-01', type: 'spp' },
  { id: 'b3', studentId: '2', studentName: 'Siti Nurhaliza', title: 'SPP Januari 2025', month: 'Januari', year: 2025, amount: 350000, paidAmount: 350000, status: 'lunas', dueDate: '2025-01-31', createdAt: '2025-01-01', type: 'spp' },
  { id: 'b4', studentId: '2', studentName: 'Siti Nurhaliza', title: 'SPP Februari 2025', month: 'Februari', year: 2025, amount: 350000, paidAmount: 0, status: 'belum_lunas', dueDate: '2025-02-28', createdAt: '2025-02-01', type: 'spp' },
  { id: 'b5', studentId: '3', studentName: 'Muhammad Fauzan', title: 'SPP Januari 2025', month: 'Januari', year: 2025, amount: 200000, paidAmount: 200000, status: 'lunas', dueDate: '2025-01-31', createdAt: '2025-01-01', type: 'spp' },
  { id: 'b6', studentId: '3', studentName: 'Muhammad Fauzan', title: 'SPP Februari 2025', month: 'Februari', year: 2025, amount: 200000, paidAmount: 0, status: 'belum_lunas', dueDate: '2025-02-28', createdAt: '2025-02-01', type: 'spp' },
  { id: 'b7', studentId: '4', studentName: 'Dewi Safitri', title: 'SPP Januari 2025', month: 'Januari', year: 2025, amount: 375000, paidAmount: 375000, status: 'lunas', dueDate: '2025-01-31', createdAt: '2025-01-01', type: 'spp' },
  { id: 'b8', studentId: '4', studentName: 'Dewi Safitri', title: 'SPP Februari 2025', month: 'Februari', year: 2025, amount: 375000, paidAmount: 0, status: 'belum_lunas', dueDate: '2025-02-28', createdAt: '2025-02-01', type: 'spp' },
  { id: 'b9', studentId: '5', studentName: 'Rizal Mahendra', title: 'SPP Januari 2025', month: 'Januari', year: 2025, amount: 375000, paidAmount: 375000, status: 'lunas', dueDate: '2025-01-31', createdAt: '2025-01-01', type: 'spp' },
  { id: 'b10', studentId: '6', studentName: 'Putri Amelia', title: 'SPP Januari 2025', month: 'Januari', year: 2025, amount: 300000, paidAmount: 0, status: 'belum_lunas', dueDate: '2025-01-31', createdAt: '2025-01-01', type: 'spp' },
];

export const mockSppSettings: SppSetting[] = [
  { id: '1', class: 'VII-A', academicYear: '2024/2025', monthlyAmount: 350000 },
  { id: '2', class: 'VII-B', academicYear: '2024/2025', monthlyAmount: 350000 },
  { id: '3', class: 'VIII-A', academicYear: '2024/2025', monthlyAmount: 375000 },
  { id: '4', class: 'VIII-B', academicYear: '2024/2025', monthlyAmount: 375000 },
  { id: '5', class: 'IX-A', academicYear: '2024/2025', monthlyAmount: 400000 },
  { id: '6', class: 'IX-B', academicYear: '2024/2025', monthlyAmount: 400000 },
];

export const mockDashboardStats: DashboardStats = {
  totalStudents: 6,
  totalPaymentsThisMonth: 5,
  unpaidStudents: 1,
  totalRevenue: 1950000,
};
