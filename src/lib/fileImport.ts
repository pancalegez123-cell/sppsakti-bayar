import { Student } from '@/types/spp';

export type StudentField = 'name' | 'nis' | 'class' | 'academicYear' | 'parentName' | 'phone' | 'address';

export const STUDENT_FIELDS: { key: StudentField; label: string }[] = [
  { key: 'name', label: 'Nama' },
  { key: 'nis', label: 'NIS' },
  { key: 'class', label: 'Kelas' },
  { key: 'academicYear', label: 'Tahun Ajaran' },
  { key: 'parentName', label: 'Wali' },
  { key: 'phone', label: 'Telepon' },
  { key: 'address', label: 'Alamat' },
];

const HEADER_ALIASES: Record<StudentField, string[]> = {
  name: ['nama', 'name', 'nama lengkap', 'nama siswa', 'siswa', 'student', 'full name', 'fullname', 'peserta didik', 'murid'],
  nis: ['nis', 'nim', 'nisn', 'no induk', 'nomor induk', 'no. induk', 'student id', 'id siswa', 'no induk siswa', 'nomor induk siswa'],
  class: ['kelas', 'class', 'kls', 'rombel', 'rombongan belajar', 'grade', 'tingkat'],
  academicYear: ['tahun', 'year', 'tahun ajaran', 'ta', 'akademik', 'academic year', 'tahun akademik', 'thn ajaran'],
  parentName: ['wali', 'parent', 'ortu', 'orang tua', 'nama wali', 'nama ortu', 'ayah', 'ibu', 'guardian', 'wali murid', 'nama orang tua'],
  phone: ['telp', 'phone', 'hp', 'telepon', 'no hp', 'no. hp', 'no telp', 'no. telp', 'nomor hp', 'wa', 'whatsapp', 'kontak', 'contact', 'telephone', 'handphone', 'nomor telepon', 'no. telepon'],
  address: ['alamat', 'address', 'domisili', 'tempat tinggal', 'alamat rumah'],
};

export function detectSeparator(text: string): string {
  const firstLine = text.trim().split('\n')[0] || '';
  const counts: Record<string, number> = { '\t': 0, ';': 0, '|': 0, ',': 0 };
  for (const char of firstLine) {
    if (char in counts) counts[char]++;
  }
  // Prefer tab > semicolon > pipe > comma
  if (counts['\t'] >= 2) return '\t';
  if (counts[';'] >= 2) return ';';
  if (counts['|'] >= 2) return '|';
  return ',';
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[._\-]/g, ' ').replace(/\s+/g, ' ');
}

export function matchHeader(header: string): StudentField | null {
  const normalized = normalizeHeader(header);
  if (!normalized) return null;

  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [StudentField, string[]][]) {
    for (const alias of aliases) {
      if (normalized === alias || normalized.includes(alias) || alias.includes(normalized)) {
        return field;
      }
    }
  }
  return null;
}

export type ColumnMapping = Record<number, StudentField | ''>;

export interface ImportPreview {
  headers: string[];
  rows: string[][];
  suggestedMapping: ColumnMapping;
  separator: string;
  allRows: string[][];
}

export function previewImport(text: string): ImportPreview {
  const separator = detectSeparator(text);
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [], suggestedMapping: {}, separator, allRows: [] };

  const headers = lines[0].split(separator).map(h => h.trim());
  const allRows = lines.slice(1).map(l => l.split(separator).map(c => c.trim())).filter(r => r.length >= 2);
  const rows = allRows.slice(0, 5);

  const suggestedMapping: ColumnMapping = {};
  const usedFields = new Set<StudentField>();

  headers.forEach((header, idx) => {
    const match = matchHeader(header);
    if (match && !usedFields.has(match)) {
      suggestedMapping[idx] = match;
      usedFields.add(match);
    } else {
      suggestedMapping[idx] = '';
    }
  });

  return { headers, rows, suggestedMapping, separator, allRows };
}

export function applyMapping(allRows: string[][], mapping: ColumnMapping): Omit<Student, 'id'>[] {
  const fieldToCol: Partial<Record<StudentField, number>> = {};
  for (const [colStr, field] of Object.entries(mapping)) {
    if (field) fieldToCol[field as StudentField] = parseInt(colStr);
  }

  return allRows
    .filter(row => row.length >= 2)
    .map(row => {
      const get = (f: StudentField, fallback = '') => {
        const col = fieldToCol[f];
        return col !== undefined ? row[col]?.trim() || fallback : fallback;
      };
      return {
        name: get('name'),
        nis: get('nis'),
        class: get('class', 'VII-A'),
        academicYear: get('academicYear', '2024/2025'),
        parentName: get('parentName'),
        phone: get('phone'),
        address: get('address'),
      };
    })
    .filter(s => s.name || s.nis);
}

// Keep legacy exports for backward compatibility
export function parseCSV(text: string): Omit<Student, 'id'>[] {
  const preview = previewImport(text);
  return applyMapping(preview.allRows, preview.suggestedMapping);
}

export function parseTextTable(text: string): Omit<Student, 'id'>[] {
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
