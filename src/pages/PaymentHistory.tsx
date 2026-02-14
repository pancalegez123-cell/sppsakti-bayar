import { useState } from 'react';
import { mockPayments, mockStudents } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MONTHS } from '@/types/spp';

export default function PaymentHistory() {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState(
    user?.role === 'wali' ? '1' : ''
  );

  const studentPayments = selectedStudentId
    ? mockPayments.filter(p => p.studentId === selectedStudentId)
    : mockPayments;

  const student = mockStudents.find(s => s.id === selectedStudentId);

  const paidMonths = studentPayments.filter(p => p.status === 'lunas').length;
  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Riwayat Pembayaran</h1>
        <p className="text-sm text-muted-foreground mt-1">Lihat detail pembayaran per siswa</p>
      </div>

      {user?.role !== 'wali' && (
        <div className="max-w-sm">
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
            <SelectContent>
              {mockStudents.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.class})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedStudentId && student && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Nama</p>
                <p className="text-sm font-semibold text-foreground mt-1">{student.name}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Kelas</p>
                <p className="text-sm font-semibold text-foreground mt-1">{student.class}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Bulan Lunas</p>
                <p className="text-sm font-semibold text-foreground mt-1">{paidMonths} / 12</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Bayar</p>
                <p className="text-sm font-semibold text-foreground mt-1">Rp {totalPaid.toLocaleString('id-ID')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly status grid */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Status Per Bulan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {MONTHS.map(month => {
                  const payment = studentPayments.find(p => p.month === month);
                  return (
                    <div
                      key={month}
                      className={`p-3 rounded-lg text-center text-xs font-medium border ${
                        payment?.status === 'lunas'
                          ? 'bg-accent border-primary/20 text-accent-foreground'
                          : payment
                          ? 'bg-warning/10 border-warning/20 text-warning'
                          : 'bg-muted border-border text-muted-foreground'
                      }`}
                    >
                      <p>{month.slice(0, 3)}</p>
                      <p className="mt-1 text-[10px]">
                        {payment?.status === 'lunas' ? '✅ Lunas' : payment ? '⚠️ Sebagian' : '—'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment details table */}
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Detail Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Bulan</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentPayments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.month} {p.year}</TableCell>
                        <TableCell>Rp {p.amount.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-muted-foreground">{p.paymentDate}</TableCell>
                        <TableCell className="text-muted-foreground">{p.method === 'cash' ? 'Tunai' : 'Transfer'}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            p.status === 'lunas'
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {p.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {studentPayments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Belum ada data pembayaran
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedStudentId && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Pilih siswa untuk melihat riwayat pembayaran
        </div>
      )}
    </div>
  );
}
