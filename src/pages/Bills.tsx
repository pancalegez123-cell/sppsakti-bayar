import { useState } from 'react';
import { mockStudents, mockBills, mockSppSettings } from '@/data/mockData';
import { Bill, MONTHS, CLASSES } from '@/types/spp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Zap, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const BILL_CATEGORIES = ['SPP', 'Snack', 'Kegiatan', 'Seragam', 'Buku', 'Lainnya'];

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [autoDialogOpen, setAutoDialogOpen] = useState(false);

  // Manual bill form
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [billTitle, setBillTitle] = useState('');
  const [billMonth, setBillMonth] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billType, setBillType] = useState<'spp' | 'lainnya'>('lainnya');
  const [billCategory, setBillCategory] = useState('Lainnya');

  // Auto generate form
  const [autoMonth, setAutoMonth] = useState('');
  const [autoYear, setAutoYear] = useState('2025');
  const [autoClass, setAutoClass] = useState<string>('all');
  const [autoCategory, setAutoCategory] = useState('SPP');
  const [autoCustomAmount, setAutoCustomAmount] = useState('');

  const filtered = bills.filter(b => {
    const matchSearch = b.studentName.toLowerCase().includes(search.toLowerCase()) ||
      b.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchCategory = filterCategory === 'all' || (b.category || 'SPP') === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const handleManualSave = () => {
    const student = mockStudents.find(s => s.id === selectedStudentId);
    if (!student || !billTitle || !billAmount || !billDueDate) {
      toast.error('Lengkapi semua data tagihan');
      return;
    }
    const newBill: Bill = {
      id: `b-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      title: billTitle,
      month: billMonth || '-',
      year: parseInt(autoYear) || 2025,
      amount: parseInt(billAmount),
      paidAmount: 0,
      status: 'belum_lunas',
      dueDate: billDueDate,
      createdAt: new Date().toISOString().split('T')[0],
      type: billType,
      category: billCategory,
    };
    setBills(prev => [newBill, ...prev]);
    toast.success(`Tagihan untuk ${student.name} berhasil dibuat`);
    setManualDialogOpen(false);
    setSelectedStudentId('');
    setBillTitle('');
    setBillMonth('');
    setBillAmount('');
    setBillDueDate('');
    setBillCategory('Lainnya');
  };

  const handleAutoGenerate = () => {
    if (!autoMonth) {
      toast.error('Pilih bulan untuk generate tagihan');
      return;
    }
    const year = parseInt(autoYear) || 2025;
    const targetStudents = autoClass === 'all'
      ? mockStudents
      : mockStudents.filter(s => s.class === autoClass);

    const isSpp = autoCategory === 'SPP';
    const categoryKey = autoCategory.toLowerCase();
    const existingKeys = new Set(bills.map(b => `${b.studentId}-${b.month}-${b.year}-${(b.category || 'SPP').toLowerCase()}`));
    let created = 0;

    const newBills: Bill[] = [];
    targetStudents.forEach(student => {
      const key = `${student.id}-${autoMonth}-${year}-${categoryKey}`;
      if (existingKeys.has(key)) return;

      let amount: number;
      if (isSpp) {
        const sppSetting = mockSppSettings.find(s => s.class === student.class);
        amount = student.customSppAmount ?? sppSetting?.monthlyAmount ?? 0;
      } else {
        amount = parseInt(autoCustomAmount) || 0;
        if (amount <= 0) {
          toast.error('Masukkan jumlah tagihan yang valid');
          return;
        }
      }

      const monthIndex = MONTHS.indexOf(autoMonth);
      const lastDay = new Date(year, monthIndex + 1, 0).getDate();

      newBills.push({
        id: `b-${Date.now()}-${student.id}`,
        studentId: student.id,
        studentName: student.name,
        title: `${autoCategory} ${autoMonth} ${year}`,
        month: autoMonth,
        year,
        amount,
        paidAmount: 0,
        status: 'belum_lunas',
        dueDate: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${lastDay}`,
        createdAt: new Date().toISOString().split('T')[0],
        type: isSpp ? 'spp' : 'lainnya',
        category: autoCategory,
      });
      created++;
    });

    if (created === 0) {
      toast.info('Semua tagihan untuk bulan ini sudah ada');
    } else {
      setBills(prev => [...newBills, ...prev]);
      toast.success(`${created} tagihan ${autoCategory} ${autoMonth} ${year} berhasil dibuat`);
    }
    setAutoDialogOpen(false);
  };

  const totalUnpaid = filtered.filter(b => b.status === 'belum_lunas').length;
  const totalUnpaidAmount = filtered
    .filter(b => b.status === 'belum_lunas')
    .reduce((sum, b) => sum + (b.amount - b.paidAmount), 0);
  const totalOverpayment = filtered.reduce((sum, b) => sum + (b.overpayment || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tagihan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalUnpaid} belum lunas · Rp {totalUnpaidAmount.toLocaleString('id-ID')}
            {totalOverpayment > 0 && (
              <span className="text-primary"> · Kelebihan: Rp {totalOverpayment.toLocaleString('id-ID')}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={autoDialogOpen} onOpenChange={setAutoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Zap className="w-4 h-4 mr-2" /> Generate Tagihan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Tagihan Otomatis</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Buat tagihan bulanan untuk semua siswa sekaligus. Pilih kategori (SPP, Snack, dll) dan jumlahnya.
              </p>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label>Kategori Tagihan</Label>
                  <Select value={autoCategory} onValueChange={setAutoCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BILL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bulan</Label>
                    <Select value={autoMonth} onValueChange={setAutoMonth}>
                      <SelectTrigger><SelectValue placeholder="Pilih bulan" /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun</Label>
                    <Input value={autoYear} onChange={e => setAutoYear(e.target.value)} type="number" />
                  </div>
                </div>
                {autoCategory !== 'SPP' && (
                  <div className="space-y-2">
                    <Label>Jumlah per Siswa (Rp)</Label>
                    <Input 
                      type="number" 
                      value={autoCustomAmount} 
                      onChange={e => setAutoCustomAmount(e.target.value)} 
                      placeholder="Misal: 25000 untuk snack" 
                    />
                    <p className="text-xs text-muted-foreground">Jumlah bisa berbeda tiap bulan sesuai kebutuhan</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Filter Kelas</Label>
                  <Select value={autoClass} onValueChange={setAutoClass}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kelas</SelectItem>
                      {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAutoGenerate} className="w-full">
                  <Zap className="w-4 h-4 mr-2" /> Generate Tagihan
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Tagihan Manual</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Tagihan Manual</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label>Siswa</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                    <SelectContent>
                      {mockStudents.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.class})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Judul Tagihan</Label>
                  <Input value={billTitle} onChange={e => setBillTitle(e.target.value)} placeholder="Mis: Snack Maret, Biaya Kegiatan..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={billCategory} onValueChange={setBillCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BILL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jumlah (Rp)</Label>
                    <Input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="25000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bulan</Label>
                    <Select value={billMonth} onValueChange={setBillMonth}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jatuh Tempo</Label>
                    <Input type="date" value={billDueDate} onChange={e => setBillDueDate(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleManualSave} className="w-full">Simpan Tagihan</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cari nama siswa atau tagihan..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
            <SelectItem value="lunas">Lunas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {BILL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Siswa</TableHead>
                  <TableHead>Tagihan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead className="hidden md:table-cell">Terbayar</TableHead>
                  <TableHead className="hidden md:table-cell">Sisa/Lebih</TableHead>
                  <TableHead className="hidden md:table-cell">Jatuh Tempo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(bill => {
                  const remaining = bill.amount - bill.paidAmount;
                  const overpay = bill.overpayment || 0;
                  return (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.studentName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">{bill.title}</span>
                          {(bill.category && bill.category !== 'SPP') && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{bill.category}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">Rp {bill.amount.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        Rp {bill.paidAmount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {overpay > 0 ? (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +Rp {overpay.toLocaleString('id-ID')}
                          </span>
                        ) : remaining > 0 ? (
                          <span className="flex items-center gap-1 text-warning font-medium">
                            <TrendingDown className="w-3.5 h-3.5" />
                            Rp {remaining.toLocaleString('id-ID')}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{bill.dueDate}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          bill.status === 'lunas'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {bill.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada tagihan
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
