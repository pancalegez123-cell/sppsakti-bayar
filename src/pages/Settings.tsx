import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { mockSppSettings } from '@/data/mockData';
import { SppSetting, ROLE_LABELS, UserRole, User } from '@/types/spp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Save, School, Receipt, KeyRound, Settings2, Users, Plus, Trash2, RotateCcw, Upload, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, users, addUser, updateUser, deleteUser, resetPassword, changePassword } = useAuth();
  const { schoolInfo, receiptHeader, classes, sppSettings, updateSchoolInfo, updateReceiptHeader, addClass, deleteClass } = useData();

  // SPP Settings
  const [settings, setSettings] = useState<SppSetting[]>(mockSppSettings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  // School Info (local form state synced from context)
  const [schoolForm, setSchoolForm] = useState(schoolInfo);
  const [receiptForm, setReceiptForm] = useState(receiptHeader);

  // Account
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // User management
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'operator' as UserRole });
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);

  // Class management
  const [newClassName, setNewClassName] = useState('');

  // Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      toast.error('Ukuran logo maksimal 500KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSchoolForm(p => ({ ...p, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // SPP handlers
  const handleEditSpp = (setting: SppSetting) => {
    setEditingId(setting.id);
    setEditAmount(setting.monthlyAmount.toString());
  };
  const handleSaveSpp = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, monthlyAmount: parseInt(editAmount) } : s));
    setEditingId(null);
    toast.success('Tarif SPP diperbarui');
  };

  // School save
  const handleSaveSchool = () => {
    updateSchoolInfo(schoolForm);
    toast.success('Data sekolah berhasil disimpan');
  };

  // Receipt save
  const handleSaveReceipt = () => {
    updateReceiptHeader(receiptForm);
    toast.success('Kop kwitansi berhasil disimpan');
  };

  // Account save
  const handleSaveAccount = () => {
    if (accountForm.newPassword) {
      if (accountForm.newPassword !== accountForm.confirmPassword) {
        toast.error('Password baru tidak cocok');
        return;
      }
      const ok = changePassword(accountForm.currentPassword, accountForm.newPassword);
      if (!ok) {
        toast.error('Password saat ini salah');
        return;
      }
    }
    toast.success('Data akun berhasil diperbarui');
    setAccountForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  // User CRUD
  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'operator' });
    setUserDialogOpen(true);
  };
  const openEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, password: '', role: u.role });
    setUserDialogOpen(true);
  };
  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) {
      toast.error('Nama dan email wajib diisi');
      return;
    }
    if (editingUser) {
      const ok = updateUser(editingUser.id, { name: userForm.name, email: userForm.email, role: userForm.role });
      if (!ok) { toast.error('Email sudah digunakan'); return; }
      toast.success('User berhasil diperbarui');
    } else {
      if (!userForm.password) { toast.error('Password wajib diisi'); return; }
      const ok = addUser({ name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role });
      if (!ok) { toast.error('Email sudah digunakan'); return; }
      toast.success('User berhasil ditambahkan');
    }
    setUserDialogOpen(false);
  };
  const handleDeleteUser = (id: string) => {
    if (id === user?.id) { toast.error('Tidak bisa menghapus akun sendiri'); return; }
    deleteUser(id);
    toast.success('User berhasil dihapus');
  };
  const handleResetPassword = (u: User) => {
    const newPass = resetPassword(u.id);
    if (newPass) setResetResult({ name: u.name, password: newPass });
  };

  // Class management
  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    addClass(newClassName.trim().toUpperCase());
    setNewClassName('');
    toast.success('Kelas ditambahkan');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola data sekolah, pengguna, kwitansi, tarif SPP, dan akun</p>
      </div>

      <Tabs defaultValue="school" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto">
          <TabsTrigger value="school" className="gap-1.5 text-xs sm:text-sm">
            <School className="w-4 h-4" /> Sekolah
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
            <Users className="w-4 h-4" /> Pengguna
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

        {/* ============ SCHOOL TAB ============ */}
        <TabsContent value="school">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Data Sekolah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo Sekolah</Label>
                <div className="flex items-center gap-4">
                  {schoolForm.logo ? (
                    <div className="relative w-20 h-20 border border-border rounded-lg overflow-hidden bg-muted">
                      <img src={schoolForm.logo} alt="Logo" className="w-full h-full object-contain" />
                      <button
                        onClick={() => setSchoolForm(p => ({ ...p, logo: undefined }))}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-destructive text-destructive-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" /> Upload Logo
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Maks. 500KB, format JPG/PNG</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Sekolah</Label>
                  <Input value={schoolForm.name} onChange={e => setSchoolForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>NPSN</Label>
                  <Input value={schoolForm.npsn} onChange={e => setSchoolForm(p => ({ ...p, npsn: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Textarea value={schoolForm.address} onChange={e => setSchoolForm(p => ({ ...p, address: e.target.value }))} rows={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input value={schoolForm.phone} onChange={e => setSchoolForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={schoolForm.email} onChange={e => setSchoolForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kepala Sekolah</Label>
                  <Input value={schoolForm.principal} onChange={e => setSchoolForm(p => ({ ...p, principal: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Bendahara</Label>
                  <Input value={schoolForm.treasurer} onChange={e => setSchoolForm(p => ({ ...p, treasurer: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tahun Ajaran Aktif</Label>
                <Input value={schoolForm.academicYear} onChange={e => setSchoolForm(p => ({ ...p, academicYear: e.target.value }))} placeholder="2024/2025" />
              </div>

              {/* Class management */}
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Kelola Kelas</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {classes.map(c => (
                    <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm">
                      {c}
                      <button onClick={() => { deleteClass(c); toast.success(`Kelas ${c} dihapus`); }} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Nama kelas baru" className="w-40"
                    onKeyDown={e => e.key === 'Enter' && handleAddClass()} />
                  <Button variant="outline" size="sm" onClick={handleAddClass}><Plus className="w-4 h-4 mr-1" /> Tambah</Button>
                </div>
              </div>

              <Button onClick={handleSaveSchool}>
                <Save className="w-4 h-4 mr-2" /> Simpan Data Sekolah
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ USERS TAB ============ */}
        <TabsContent value="users">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Manajemen Pengguna</CardTitle>
              <Button size="sm" onClick={openAddUser}><Plus className="w-4 h-4 mr-1" /> Tambah User</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
                          {ROLE_LABELS[u.role]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditUser(u)} title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleResetPassword(u)} title="Reset Password">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          {u.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Hapus"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus User</AlertDialogTitle>
                                  <AlertDialogDescription>Yakin ingin menghapus {u.name}? Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(u.id)}>Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add/Edit User Dialog */}
          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={userForm.role} onValueChange={v => setUserForm(p => ({ ...p, role: v as UserRole }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="bendahara">Bendahara</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Batal</Button>
                <Button onClick={handleSaveUser}><Save className="w-4 h-4 mr-1" /> Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reset password result dialog */}
          <Dialog open={!!resetResult} onOpenChange={() => setResetResult(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Password Direset</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Password baru untuk <span className="font-semibold text-foreground">{resetResult?.name}</span>:</p>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <code className="text-lg font-mono font-bold text-foreground">{resetResult?.password}</code>
                </div>
                <p className="text-xs text-muted-foreground">Salin dan berikan ke pengguna. Password ini tidak bisa dilihat lagi.</p>
              </div>
              <DialogFooter>
                <Button onClick={() => { navigator.clipboard.writeText(resetResult?.password || ''); toast.success('Password disalin'); }}>Salin</Button>
                <Button variant="outline" onClick={() => setResetResult(null)}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ============ RECEIPT TAB ============ */}
        <TabsContent value="receipt">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Kop Kwitansi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Baris 1 (Yayasan / Instansi)</Label>
                <Input value={receiptForm.line1} onChange={e => setReceiptForm(p => ({ ...p, line1: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Baris 2 (Nama Sekolah)</Label>
                <Input value={receiptForm.line2} onChange={e => setReceiptForm(p => ({ ...p, line2: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Baris 3 (Alamat & Kontak)</Label>
                <Input value={receiptForm.line3} onChange={e => setReceiptForm(p => ({ ...p, line3: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Catatan Kaki Kwitansi</Label>
                <Input value={receiptForm.footer} onChange={e => setReceiptForm(p => ({ ...p, footer: e.target.value }))} />
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 border border-border rounded-lg bg-background">
                <p className="text-xs text-muted-foreground mb-2">Preview Kop Kwitansi:</p>
                <div className="text-center space-y-0.5">
                  <div className="flex items-center justify-center gap-3">
                    {schoolInfo.logo && (
                      <img src={schoolInfo.logo} alt="Logo" className="w-10 h-10 object-contain" />
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide">{receiptForm.line1}</p>
                      <p className="text-sm font-bold">{receiptForm.line2}</p>
                      <p className="text-xs text-muted-foreground">{receiptForm.line3}</p>
                    </div>
                  </div>
                  <div className="border-b-2 border-foreground mt-2" />
                </div>
              </div>

              <Button onClick={handleSaveReceipt}>
                <Save className="w-4 h-4 mr-2" /> Simpan Kop Kwitansi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ SPP TAB ============ */}
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
                          <Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-40" />
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

        {/* ============ ACCOUNT TAB ============ */}
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

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="px-3 py-2 rounded-md border border-input bg-muted text-sm text-muted-foreground">
                  {user ? ROLE_LABELS[user.role] : '-'}
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
                  <p><span className="font-medium">Operator:</span> operator@spp.id / operator123</p>
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
