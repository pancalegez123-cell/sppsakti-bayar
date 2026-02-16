

## Rencana Implementasi

### Masalah Saat Ini
1. **Halaman Siswa** sudah punya fitur tambah manual, impor file, dan hapus massal - tapi perlu dipoles sedikit (tambah dukungan Excel/Word)
2. **Pembayaran dan Tagihan tidak terhubung** - saat pembayaran dicatat, tagihan tidak otomatis terupdate. Tagihan yang lunas tetap muncul di daftar

### Yang Akan Dikerjakan

#### 1. Shared State Management
Buat context global agar data siswa, tagihan, dan pembayaran bisa diakses dan diupdate dari semua halaman:
- `DataContext` menyimpan state `students`, `bills`, `payments` secara terpusat
- Semua halaman (Students, Bills, Payments) menggunakan context ini, bukan state lokal masing-masing

#### 2. Integrasi Pembayaran ke Tagihan
Saat mencatat pembayaran baru:
- Tampilkan dropdown tagihan yang belum lunas untuk siswa yang dipilih
- Jumlah bayar otomatis mengurangi sisa tagihan (`paidAmount` bertambah)
- Jika `paidAmount >= amount`, status tagihan berubah ke **lunas**
- Jika bayar lebih, selisihnya dicatat di `overpayment`

#### 3. Tagihan Lunas Otomatis Tersembunyi
- Default filter di halaman Tagihan menampilkan **hanya yang belum lunas**
- Tagihan lunas tetap bisa dilihat dengan mengganti filter status ke "Semua" atau "Lunas"

#### 4. Perbaikan Impor Siswa
- Tambah dukungan format file Excel (.xlsx) dan Word (.docx) - karena ini aplikasi browser tanpa backend, file Excel/Word akan dibaca sebagai teks/CSV, dengan panduan format yang jelas
- Perbaiki UI dialog impor agar lebih informatif

---

### Detail Teknis

**File baru:**
- `src/contexts/DataContext.tsx` - Context terpusat untuk students, bills, payments dengan fungsi CRUD

**File yang diubah:**
- `src/pages/Students.tsx` - Ganti local state ke DataContext
- `src/pages/Bills.tsx` - Ganti local state ke DataContext, default filter "belum_lunas"
- `src/pages/Payments.tsx` - Ganti local state ke DataContext, tambah pilihan tagihan saat catat pembayaran, otomatis update status tagihan
- `src/App.tsx` - Wrap dengan DataProvider
- `src/lib/fileImport.ts` - Tambah dukungan format Excel/Word (best-effort parsing)

