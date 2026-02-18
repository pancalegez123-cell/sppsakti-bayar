
## Impor Siswa yang Lebih Fleksibel

### Masalah Saat Ini
Parser impor saat ini cukup kaku:
- Hanya mencocokkan header tertentu (`nama`, `nis`, `kelas`, dll.)
- Tab-separated file tidak mendeteksi header sama sekali, langsung pakai posisi kolom
- Tidak mendukung variasi penulisan seperti "Nama Lengkap", "No. Induk Siswa", "Nomor HP", "Kls", dll.
- Tidak ada preview data sebelum diimpor, sehingga pengguna tidak tahu apakah kolom terbaca benar

### Yang Akan Dikerjakan

#### 1. Smart Header Matching
Perluas sistem pencocokan header dengan alias yang lebih banyak dan fuzzy matching:
- **Nama**: `nama`, `name`, `nama lengkap`, `nama siswa`, `siswa`, `student`, `full name`
- **NIS**: `nis`, `nim`, `nisn`, `no induk`, `nomor induk`, `no. induk`, `student id`, `id siswa`
- **Kelas**: `kelas`, `class`, `kls`, `rombel`, `rombongan belajar`, `grade`
- **Tahun Ajaran**: `tahun`, `year`, `tahun ajaran`, `ta`, `akademik`, `academic year`
- **Wali/Orang Tua**: `wali`, `parent`, `ortu`, `orang tua`, `nama wali`, `nama ortu`, `ayah`, `ibu`, `guardian`
- **Telepon**: `telp`, `phone`, `hp`, `telepon`, `no hp`, `no. hp`, `no telp`, `no. telp`, `nomor hp`, `wa`, `whatsapp`, `kontak`, `contact`
- **Alamat**: `alamat`, `address`, `domisili`, `tempat tinggal`

#### 2. Otomatis Deteksi Separator
Deteksi otomatis apakah file menggunakan koma, tab, titik koma (`;`), atau pipe (`|`) sebagai pemisah kolom.

#### 3. Preview Sebelum Impor
Setelah file dipilih, tampilkan tabel preview 5 baris pertama agar pengguna bisa melihat apakah kolom terbaca dengan benar sebelum menekan tombol "Impor".

#### 4. Mapping Kolom Manual (Fallback)
Jika header tidak dikenali otomatis, tampilkan dropdown untuk setiap kolom yang terdeteksi agar pengguna bisa menentukan sendiri kolom mana yang berisi Nama, NIS, Kelas, dll.

---

### Detail Teknis

**File yang diubah:**

- `src/lib/fileImport.ts`
  - Tambah konstanta `HEADER_ALIASES` berisi mapping field ke daftar alias
  - Buat fungsi `detectSeparator(text)` untuk mendeteksi separator otomatis (`,`, `\t`, `;`, `|`)
  - Buat fungsi `matchHeader(header, aliases)` yang mencocokkan header dengan skor kecocokan
  - Update `parseCSV` dan `parseTextTable` jadi satu fungsi `parseImportFile(text)` yang lebih cerdas
  - Tambah fungsi `previewImport(text)` yang mengembalikan headers terdeteksi + 5 baris pertama + mapping kolom yang disarankan

- `src/pages/Students.tsx`
  - Tambah state `previewData` untuk menyimpan hasil preview
  - Tambah state `columnMapping` untuk mapping kolom manual
  - Setelah file dipilih, tampilkan tabel preview + dropdown mapping kolom
  - Tombol "Impor" baru aktif setelah preview ditampilkan
  - Pengguna bisa koreksi mapping kolom sebelum impor final
