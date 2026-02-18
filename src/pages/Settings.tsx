import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSppSettings } from '@/data/mockData';
import { SppSetting, CLASSES } from '@/types/spp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Save, School, Receipt, KeyRound, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

interface SchoolInfo {
  name: string;
  npsn: string;
  address: string;
  phone: string;
  email: string;
  principal: string;
  treasurer: string;
}

interface ReceiptHeader {
  line1: string;
  line2: string;
  line3: string;
  footer: string;
}

export default function SettingsPage() {
  const { user } = useAuth();

  // SPP Settings
  const [settings, setSettings] = useState<SppSetting[]>(mockSppSettings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  // School Info
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: 'SMP Negeri 1 Contoh',
    npsn: '12345678',
    address: 'Jl. Pendidikan No. 1, Kota Contoh, Jawa Barat 40100',
    phone: '022-1234567',
    email: 'info@smpn1contoh.sch.id',
    principal: 'Drs. Ahmad Sudrajat, M.Pd.',
    treasurer: 'Siti Nurhaliza, S.Pd.',
  });

  // Receipt Header
  const [receiptHeader, setReceiptHeader] = useState<ReceiptHeader>({
    line1: 'YAYASAN PENDIDIKAN CONTOH',
    line2: 'SMP NEGERI 1 CONTOH',
    line3: 'Jl. Pendidikan No. 1, Kota Contoh | Telp. 022-1234567',
    footer: 'Kwitansi ini sah tanpa tanda tangan basah',
  });

  // Account
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleEditSpp = (setting: SppSetting) => {
    setEditingId(setting.id);
    setEditAmount(setting.monthlyAmount.toString());
  };

  const handleSaveSpp = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, monthlyAmount: parseInt(editAmount) } : s));
    setEditingId(null);
    toast.success('Tarif SPP diperbarui');
  };

  const handleSaveSchool = () => {
    toast.success('Data sekolah berhasil disimpan');
  };

  const handleSaveReceipt = () => {
    toast.success('Kop kwitansi berhasil disimpan');
  };

  const handleSaveAccount = () => {
    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }
    toast.success('Data akun berhasil diperbarui');
    setAccountForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola data sekolah, kwitansi, tarif SPP, dan akun</p>
      </div>

      <Tabs defaultValue="school" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="school" className="gap-1.5 text-xs sm:text-sm">
            <School className="w-4 h-4" /> Sekolah
          </TabsTrigger>
          <TabsTrigger value="receipt" className="gap-1.5 text-xs sm:text-sm">
            <Receipt className="w-4 h-4" /> Kwitansi
          </TabsTrigger>
          <TabsTrigger value="spp" className="gap-1.5 text-xs sm:text-sm">
            <Settings2 className="w-4 h-4" /> Tarif SPP
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-1.5 text-xs sm:text-sm">
            <KeyRound className="w-4 h-4" /> Akun
          </TabsTrigger>
        </TabsList>

        {/* School Info Tab */}
        <TabsContent value="school">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Data Sekolah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Sekolah</Label>
                  <Input value={schoolInfo.name} onChange={e => setSchoolInfo(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>NPSN</Label>
                  <Input value={schoolInfo.npsn} onChange={e => setSchoolInfo(p => ({ ...p, npsn: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Textarea value={schoolInfo.address} onChange={e => setSchoolInfo(p => ({ ...p, address: e.target.value }))} rows={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input value={schoolInfo.phone} onChange={e => setSchoolInfo(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={schoolInfo.email} onChange={e => setSchoolInfo(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kepala Sekolah</Label>
                  <Input value={schoolInfo.principal} onChange={e => setSchoolInfo(p => ({ ...p, principal: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Bendahara</Label>
                  <Input value={schoolInfo.treasurer} onChange={e => setSchoolInfo(p => ({ ...p, treasurer: e.target.value }))} />
                </div>
              </div>
              <Button onClick={handleSaveSchool}>
                <Save className="w-4 h-4 mr-2" /> Simpan Data Sekolah
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Header Tab */}
        <TabsContent value="receipt">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Kop Kwitansi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Baris 1 (Yayasan / Instansi)</Label>
                <Input value={receiptHeader.line1} onChange={e => setReceiptHeader(p => ({ ...p, line1: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Baris 2 (Nama Sekolah)</Label>
                <Input value={receiptHeader.line2} onChange={e => setReceiptHeader(p => ({ ...p, line2: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Baris 3 (Alamat & Kontak)</Label>
                <Input value={receiptHeader.line3} onChange={e => setReceiptHeader(p => ({ ...p, line3: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Catatan Kaki Kwitansi</Label>
                <Input value={receiptHeader.footer} onChange={e => setReceiptHeader(p => ({ ...p, footer: e.target.value }))} />
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 border border-border rounded-lg bg-background">
                <p className="text-xs text-muted-foreground mb-2">Preview Kop Kwitansi:</p>
                <div className="text-center space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-wide">{receiptHeader.line1}</p>
                  <p className="text-sm font-bold">{receiptHeader.line2}</p>
                  <p className="text-xs text-muted-foreground">{receiptHeader.line3}</p>
                  <div className="border-b-2 border-foreground mt-2" />
                </div>
              </div>

              <Button onClick={handleSaveReceipt}>
                <Save className="w-4 h-4 mr-2" /> Simpan Kop Kwitansi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPP Rates Tab */}
        <TabsContent value="spp">
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Tarif SPP per Kelas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Kelas</TableHead>
                    <TableHead>Tahun Ajaran</TableHead>
                    <TableHead>Tarif Bulanan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map(setting => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.class}</TableCell>
                      <TableCell className="text-muted-foreground">{setting.academicYear}</TableCell>
                      <TableCell>
                        {editingId === setting.id ? (
                          <Input
                            type="number"
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                            className="w-40"
                          />
                        ) : (
                          <span className="font-semibold">Rp {setting.monthlyAmount.toLocaleString('id-ID')}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === setting.id ? (
                          <Button size="sm" onClick={() => handleSaveSpp(setting.id)}>
                            <Save className="w-4 h-4 mr-1" /> Simpan
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => handleEditSpp(setting)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Manajemen Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input value={accountForm.name} onChange={e => setAccountForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Ganti Password</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Password Saat Ini</Label>
                    <Input type="password" value={accountForm.currentPassword} onChange={e => setAccountForm(p => ({ ...p, currentPassword: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Password Baru</Label>
                    <Input type="password" value={accountForm.newPassword} onChange={e => setAccountForm(p => ({ ...p, newPassword: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Konfirmasi Password</Label>
                    <Input type="password" value={accountForm.confirmPassword} onChange={e => setAccountForm(p => ({ ...p, confirmPassword: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Demo accounts info */}
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Demo Akun:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="font-medium">Admin:</span> admin@spp.id / admin123</p>
                  <p><span className="font-medium">Bendahara:</span> bendahara@spp.id / bendahara123</p>
                  <p><span className="font-medium">Wali Murid:</span> wali@spp.id / wali123</p>
                </div>
              </div>

              <Button onClick={handleSaveAccount}>
                <Save className="w-4 h-4 mr-2" /> Simpan Perubahan Akun
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
