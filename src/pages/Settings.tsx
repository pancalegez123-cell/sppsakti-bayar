import { useState } from 'react';
import { mockSppSettings } from '@/data/mockData';
import { SppSetting, CLASSES } from '@/types/spp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SppSetting[]>(mockSppSettings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const handleEdit = (setting: SppSetting) => {
    setEditingId(setting.id);
    setEditAmount(setting.monthlyAmount.toString());
  };

  const handleSave = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, monthlyAmount: parseInt(editAmount) } : s));
    setEditingId(null);
    toast.success('Tarif SPP diperbarui');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan SPP</h1>
        <p className="text-sm text-muted-foreground mt-1">Atur tarif SPP per kelas dan tahun ajaran</p>
      </div>

      <Card className="glass-card overflow-hidden">
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
                      <Button size="sm" onClick={() => handleSave(setting.id)}>
                        <Save className="w-4 h-4 mr-1" /> Simpan
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(setting)}>
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
    </div>
  );
}
