import { useState } from 'react';
import { Payment, MONTHS } from '@/types/spp';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Printer, Search, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateWhatsAppUrl, createPaymentMessage } from '@/lib/whatsapp';

export default function Payments() {
  const { students, bills, payments, addPayment, recordPaymentForBill } = useData();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBillId, setSelectedBillId] = useState('');
  const [month, setMonth] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
  const [notes, setNotes] = useState('');

  // WhatsApp notification state
  const [waDialogOpen, setWaDialogOpen] = useState(false);
  const [waPayment, setWaPayment] = useState<Payment | null>(null);
  const [waToParent, setWaToParent] = useState(true);
  const [waToAdmin, setWaToAdmin] = useState(false);
  const [waToBendahara, setWaToBendahara] = useState(false);
  const [waCustomPhone, setWaCustomPhone] = useState('');

  const adminPhone = '081200000001';
  const bendaharaPhone = '081200000002';

  // Get unpaid bills for selected student
  const studentBills = selectedStudentId
    ? bills.filter(b => b.studentId === selectedStudentId && b.status === 'belum_lunas')
    : [];

  const filtered = payments.filter(p =>
    p.studentName.toLowerCase().includes(search.toLowerCase()) ||
    p.month.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student || !amount) {
      toast.error('Lengkapi semua data pembayaran');
      return;
    }

    const amountNum = parseInt(amount);
    const selectedBill = bills.find(b => b.id === selectedBillId);
    const paymentMonth = selectedBill ? selectedBill.month : month;
    const paymentYear = selectedBill ? selectedBill.year : 2025;

    if (!paymentMonth) {
      toast.error('Pilih bulan atau tagihan');
      return;
    }

    const status = selectedBill
      ? (amountNum >= (selectedBill.amount - selectedBill.paidAmount) ? 'lunas' : 'belum_lunas')
      : 'belum_lunas';

    const newPaymentData: Omit<Payment, 'id'> = {
      studentId: student.id,
      studentName: student.name,
      month: paymentMonth,
      year: paymentYear,
      amount: amountNum,
      paymentDate: new Date().toISOString().split('T')[0],
      method,
      notes,
      status,
    };

    if (selectedBillId) {
      recordPaymentForBill(newPaymentData, selectedBillId);
      toast.success(`Pembayaran ${student.name} dicatat & tagihan diperbarui`);
    } else {
      addPayment(newPaymentData);
      toast.success(`Pembayaran ${student.name} berhasil dicatat`);
    }

    // Create a full payment object for WA dialog
    const fullPayment: Payment = { ...newPaymentData, id: `p-${Date.now()}`, billId: selectedBillId || undefined };
    setDialogOpen(false);
    setSelectedStudentId('');
    setSelectedBillId('');
    setMonth('');
    setAmount('');
    setNotes('');

    setWaPayment(fullPayment);
    setWaDialogOpen(true);
  };

  const handleSendWa = () => {
    if (!waPayment) return;
    const student = students.find(s => s.id === waPayment.studentId);
    const message = createPaymentMessage(waPayment, student?.class);

    const recipients: string[] = [];
    if (waToParent && student?.phone) recipients.push(student.phone);
    if (waToAdmin) recipients.push(adminPhone);
    if (waToBendahara) recipients.push(bendaharaPhone);
    if (waCustomPhone.trim()) recipients.push(waCustomPhone.trim());

    if (recipients.length === 0) {
      toast.error('Pilih minimal satu penerima');
      return;
    }

    recipients.forEach(phone => {
      window.open(generateWhatsAppUrl(phone, message), '_blank');
    });

    toast.success(`Notifikasi WhatsApp dikirim ke ${recipients.length} penerima`);
    setWaDialogOpen(false);
    setWaPayment(null);
    setWaCustomPhone('');
  };

  const handleOpenWa = (payment: Payment) => {
    setWaPayment(payment);
    setWaDialogOpen(true);
  };

  const handlePrint = (payment: Payment) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;
    const student = students.find(s => s.id === payment.studentId);
    receiptWindow.document.write(`
      <html><head><title>Kwitansi SPP</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; max-width: 400px; margin: 40px auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 16px; }
        .header h1 { color: #16a34a; margin: 0; font-size: 20px; }
        .header p { color: #666; margin: 4px 0 0; font-size: 12px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .row .label { color: #666; }
        .total { border-top: 2px solid #16a34a; margin-top: 12px; padding-top: 12px; font-weight: bold; font-size: 16px; }
        .status { text-align: center; margin-top: 16px; padding: 8px; border-radius: 8px; font-weight: 600; }
        .lunas { background: #dcfce7; color: #16a34a; }
        .belum { background: #fef3c7; color: #d97706; }
        .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #999; }
        @media print { body { margin: 0; } }
      </style></head><body>
        <div class="header">
          <h1>🎓 SPP Manager</h1>
          <p>Kwitansi Pembayaran SPP</p>
        </div>
        <div class="row"><span class="label">No. Kwitansi</span><span>SPP-${payment.id.padStart(5, '0')}</span></div>
        <div class="row"><span class="label">Tanggal</span><span>${payment.paymentDate}</span></div>
        <div class="row"><span class="label">Nama Siswa</span><span>${payment.studentName}</span></div>
        <div class="row"><span class="label">NIS</span><span>${student?.nis || '-'}</span></div>
        <div class="row"><span class="label">Kelas</span><span>${student?.class || '-'}</span></div>
        <div class="row"><span class="label">Bulan</span><span>${payment.month} ${payment.year}</span></div>
        <div class="row"><span class="label">Metode</span><span>${payment.method === 'cash' ? 'Tunai' : 'Transfer'}</span></div>
        ${payment.notes ? `<div class="row"><span class="label">Catatan</span><span>${payment.notes}</span></div>` : ''}
        <div class="row total"><span>Total Bayar</span><span>Rp ${payment.amount.toLocaleString('id-ID')}</span></div>
        <div class="status ${payment.status === 'lunas' ? 'lunas' : 'belum'}">${payment.status === 'lunas' ? '✅ LUNAS' : '⚠️ BELUM LUNAS'}</div>
        <div class="footer"><p>Terima kasih atas pembayaran Anda</p></div>
        <script>window.print();</script>
      </body></html>
    `);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pembayaran SPP</h1>
          <p className="text-sm text-muted-foreground mt-1">{payments.length} transaksi tercatat</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Catat Pembayaran</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label>Siswa</Label>
                <Select value={selectedStudentId} onValueChange={(v) => { setSelectedStudentId(v); setSelectedBillId(''); }}>
                  <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.class})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bill selection - show unpaid bills for selected student */}
              {selectedStudentId && studentBills.length > 0 && (
                <div className="space-y-2">
                  <Label>Tagihan yang Dibayar</Label>
                  <Select value={selectedBillId} onValueChange={setSelectedBillId}>
                    <SelectTrigger><SelectValue placeholder="Pilih tagihan (opsional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa tagihan</SelectItem>
                      {studentBills.map(b => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.title} — Sisa Rp {(b.amount - b.paidAmount).toLocaleString('id-ID')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {!selectedBillId || selectedBillId === 'none' ? (
                  <div className="space-y-2">
                    <Label>Bulan</Label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger><SelectValue placeholder="Pilih bulan" /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Bulan</Label>
                    <Input value={bills.find(b => b.id === selectedBillId)?.month || ''} disabled className="bg-muted" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Jumlah (Rp)</Label>
                  <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="350000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Select value={method} onValueChange={v => setMethod(v as 'cash' | 'transfer')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catatan (opsional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan tambahan..." />
              </div>
              <Button onClick={handleSave} className="w-full">Simpan Pembayaran</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Cari nama siswa atau bulan..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Siswa</TableHead>
                  <TableHead>Bulan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead className="hidden md:table-cell">Metode</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.studentName}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.month} {payment.year}</TableCell>
                    <TableCell className="font-semibold">Rp {payment.amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {payment.method === 'cash' ? 'Tunai' : 'Transfer'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{payment.paymentDate}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        payment.status === 'lunas'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {payment.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenWa(payment)} title="Kirim notifikasi WA">
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handlePrint(payment)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Notification Dialog */}
      <Dialog open={waDialogOpen} onOpenChange={setWaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Kirim Notifikasi WhatsApp
            </DialogTitle>
          </DialogHeader>
          {waPayment && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium">{waPayment.studentName}</p>
                <p className="text-muted-foreground">{waPayment.month} {waPayment.year} · Rp {waPayment.amount.toLocaleString('id-ID')}</p>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Kirim ke:</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={waToParent} onCheckedChange={(c) => setWaToParent(!!c)} />
                    <span className="text-sm">Wali Murid ({students.find(s => s.id === waPayment.studentId)?.phone || '-'})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={waToAdmin} onCheckedChange={(c) => setWaToAdmin(!!c)} />
                    <span className="text-sm">Admin ({adminPhone})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={waToBendahara} onCheckedChange={(c) => setWaToBendahara(!!c)} />
                    <span className="text-sm">Bendahara ({bendaharaPhone})</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Nomor Tambahan (opsional)</Label>
                  <Input
                    value={waCustomPhone}
                    onChange={e => setWaCustomPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
              <Button onClick={handleSendWa} className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" /> Kirim via WhatsApp
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
