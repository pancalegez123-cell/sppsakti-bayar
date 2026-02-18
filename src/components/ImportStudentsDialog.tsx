import { useState, useRef } from 'react';
import { Student } from '@/types/spp';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  readFileAsText,
  previewImport,
  applyMapping,
  STUDENT_FIELDS,
  type ImportPreview,
  type ColumnMapping,
  type StudentField,
} from '@/lib/fileImport';

export default function ImportStudentsDialog() {
  const { addStudents } = useData();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview(null);
    setMapping({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) reset();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'txt', 'tsv'].includes(ext || '')) {
      toast.error('Format file tidak didukung. Gunakan CSV atau TXT.');
      return;
    }

    try {
      const text = await readFileAsText(file);
      const result = previewImport(text);

      if (result.allRows.length === 0) {
        toast.error('Tidak ada data valid ditemukan dalam file');
        return;
      }

      setPreview(result);
      setMapping(result.suggestedMapping);
    } catch {
      toast.error('Gagal membaca file');
    }
  };

  const updateMapping = (colIdx: number, value: string) => {
    setMapping(prev => ({ ...prev, [colIdx]: value as StudentField | '' }));
  };

  const handleImport = () => {
    if (!preview) return;

    const imported = applyMapping(preview.allRows, mapping);
    if (imported.length === 0) {
      toast.error('Tidak ada data valid. Pastikan kolom Nama atau NIS sudah dipetakan.');
      return;
    }

    addStudents(imported);
    toast.success(`${imported.length} siswa berhasil diimpor`);
    handleOpenChange(false);
  };

  const mappedFields = Object.values(mapping).filter(Boolean);
  const hasNameOrNis = mappedFields.includes('name') || mappedFields.includes('nis');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Impor</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Impor Data Siswa</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Upload file CSV atau TXT. Header kolom akan dideteksi otomatis, dan Anda bisa mengoreksi mapping sebelum mengimpor.
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Pilih file untuk diimpor</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Pilih File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Column mapping */}
            <div>
              <h3 className="text-sm font-medium mb-2">Mapping Kolom</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Pastikan setiap kolom dipetakan ke field yang benar. Kolom yang tidak dipetakan akan diabaikan.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {preview.headers.map((header, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-xs text-muted-foreground truncate" title={header}>{header}</p>
                    <Select value={mapping[idx] || '_none'} onValueChange={v => updateMapping(idx, v === '_none' ? '' : v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="-- Abaikan --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">-- Abaikan --</SelectItem>
                        {STUDENT_FIELDS.map(f => (
                          <SelectItem key={f.key} value={f.key} disabled={Object.values(mapping).includes(f.key) && mapping[idx] !== f.key}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div>
              <h3 className="text-sm font-medium mb-2">Preview ({Math.min(5, preview.rows.length)} dari {preview.allRows.length} baris)</h3>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {preview.headers.map((h, i) => (
                        <TableHead key={i} className="text-xs whitespace-nowrap">
                          {mapping[i] ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3 text-green-500" />
                              {STUDENT_FIELDS.find(f => f.key === mapping[i])?.label}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">{h}</span>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.map((row, ri) => (
                      <TableRow key={ri}>
                        {preview.headers.map((_, ci) => (
                          <TableCell key={ci} className="text-xs py-2 whitespace-nowrap">
                            {row[ci] || ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={reset}>Pilih File Lain</Button>
              <Button onClick={handleImport} disabled={!hasNameOrNis}>
                <Check className="w-4 h-4 mr-2" /> Impor {preview.allRows.length} Siswa
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
