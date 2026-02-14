import { useState } from 'react';
import { mockPayments, mockStudents } from '@/data/mockData';
import { CLASSES, MONTHS } from '@/types/spp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const [filterClass, setFilterClass] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const filtered = mockPayments.filter(p => {
    const student = mockStudents.find(s => s.id === p.studentId);
    const classMatch = filterClass === 'all' || student?.class === filterClass;
    const monthMatch = filterMonth === 'all' || p.month === filterMonth;
    return classMatch && monthMatch;
  });

  const totalAmount = filtered.reduce((sum, p) => sum + p.amount, 0);
  const lunasCount = filtered.filter(p => p.status === 'lunas').length;

  const handleExport = () => {
    const headers = ['Nama Siswa', 'Bulan', 'Tahun', 'Jumlah', 'Metode', 'Tanggal', 'Status'];
    const rows = filtered.map(p => [
      p.studentName, p.month, p.year, p.amount,
      p.method === 'cash' ? 'Tunai' : 'Transfer', p.paymentDate,
      p.status === 'lunas' ? 'Lunas' : 'Belum Lunas',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-spp-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Laporan berhasil diunduh');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan Pembayaran</h1>
          <p className="text-sm text-muted-foreground mt-1">Filter dan ekspor data pembayaran</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Ekspor CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Semua Bulan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Bulan</SelectItem>
            {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Transaksi</p>
            <p className="text-xl font-bold text-foreground mt-1">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Lunas</p>
            <p className="text-xl font-bold text-primary mt-1">{lunasCount}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Pendapatan</p>
            <p className="text-xl font-bold text-foreground mt-1">Rp {totalAmount.toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nama</TableHead>
                  <TableHead>Bulan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead className="hidden md:table-cell">Metode</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.studentName}</TableCell>
                    <TableCell className="text-muted-foreground">{p.month} {p.year}</TableCell>
                    <TableCell className="font-semibold">Rp {p.amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {p.method === 'cash' ? 'Tunai' : 'Transfer'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{p.paymentDate}</TableCell>
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
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
