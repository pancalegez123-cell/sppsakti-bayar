import { Student } from '@/types/spp';

export function parseCSV(text: string): Omit<Student, 'id'>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const students: Omit<Student, 'id'>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 2) continue;

    const get = (key: string) => {
      const idx = headers.findIndex(h => h.includes(key));
      return idx >= 0 ? values[idx] || '' : '';
    };

    students.push({
      name: get('nama') || get('name') || values[0] || '',
      nis: get('nis') || get('nim') || values[1] || '',
      class: get('kelas') || get('class') || values[2] || 'VII-A',
      academicYear: get('tahun') || get('year') || '2024/2025',
      parentName: get('wali') || get('parent') || get('ortu') || '',
      phone: get('telp') || get('phone') || get('hp') || '',
      address: get('alamat') || get('address') || '',
    });
  }
  return students;
}

export function parseTextTable(text: string): Omit<Student, 'id'>[] {
  // Try tab-separated first, then CSV
  if (text.includes('\t')) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const students: Omit<Student, 'id'>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t').map(c => c.trim());
      if (cols.length < 2) continue;
      students.push({
        name: cols[0] || '',
        nis: cols[1] || '',
        class: cols[2] || 'VII-A',
        academicYear: cols[3] || '2024/2025',
        parentName: cols[4] || '',
        phone: cols[5] || '',
        address: cols[6] || '',
      });
    }
    return students;
  }
  return parseCSV(text);
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
