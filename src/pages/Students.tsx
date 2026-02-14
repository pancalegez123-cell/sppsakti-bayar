import { useState } from 'react';
import { mockStudents } from '@/data/mockData';
import { Student, CLASSES } from '@/types/spp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyStudent: Omit<Student, 'id'> = {
  name: '', nis: '', class: 'VII-A', academicYear: '2024/2025',
  parentName: '', phone: '', address: '',
};

export default function Students() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStudent);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.nis.includes(search) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.nis) {
      toast.error('Nama dan NIS wajib diisi');
      return;
    }
    if (editingId) {
      setStudents(prev => prev.map(s => s.id === editingId ? { ...form, id: editingId } : s));
      toast.success('Data siswa diperbarui');
    } else {
      setStudents(prev => [...prev, { ...form, id: Date.now().toString() }]);
      toast.success('Siswa berhasil ditambahkan');
    }
    setDialogOpen(false);
    setForm(emptyStudent);
    setEditingId(null);
  };

  const handleEdit = (student: Student) => {
    const { id, ...rest } = student;
    setForm(rest);
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    toast.success('Siswa berhasil dihapus');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Siswa</h1>
          <p className="text-sm text-muted-foreground mt-1">{students.length} siswa terdaftar</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyStudent); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Tambah Siswa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Siswa' : 'Tambah Siswa Baru'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nama siswa" />
                </div>
                <div className="space-y-2">
                  <Label>NIS</Label>
                  <Input value={form.nis} onChange={e => setForm(p => ({ ...p, nis: e.target.value }))} placeholder="Nomor Induk" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kelas</Label>
                  <Select value={form.class} onValueChange={v => setForm(p => ({ ...p, class: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tahun Ajaran</Label>
                  <Input value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Wali</Label>
                  <Input value={form.parentName} onChange={e => setForm(p => ({ ...p, parentName: e.target.value }))} placeholder="Nama orang tua" />
                </div>
                <div className="space-y-2">
                  <Label>No. Telepon</Label>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="08xxxxxxxxxx" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Alamat lengkap" />
              </div>
              <Button onClick={handleSave} className="w-full">{editingId ? 'Simpan Perubahan' : 'Tambah Siswa'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Cari nama, NIS, atau kelas..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nama</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="hidden md:table-cell">Wali</TableHead>
                  <TableHead className="hidden lg:table-cell">Telepon</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{student.nis}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground font-medium">{student.class}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{student.parentName}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{student.phone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data siswa ditemukan
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
