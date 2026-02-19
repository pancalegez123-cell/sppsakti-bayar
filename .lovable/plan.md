
## Pengaturan Akun, Akses & Profil Sekolah yang Lengkap

### Ringkasan
Menambahkan fitur manajemen user (CRUD user + role/permission), memperkaya profil sekolah (logo upload, tahun ajaran aktif, kelola kelas), dan memindahkan semua info akun/password ke tab Pengaturan.

---

### Fitur 1: Manajemen User & Akses (Tab baru "Pengguna")

**Hanya admin yang bisa mengakses tab ini.**

- Tabel daftar user: Nama, Email, Role, Aksi (Edit/Hapus/Reset Password)
- Tombol "Tambah User" membuka dialog dengan form: Nama, Email, Password, Role (dropdown: Admin / Bendahara / Operator)
- Edit user: ubah nama, email, role
- Hapus user: konfirmasi dengan AlertDialog
- Reset password: generate password baru dan tampilkan ke admin
- Role baru "Operator" ditambahkan -- hanya bisa akses halaman Siswa (input data siswa saja)

**Perubahan terkait:**
- `src/types/spp.ts` -- tambah `'operator'` ke `UserRole`, update `ROLE_LABELS`
- `src/contexts/AuthContext.tsx` -- tambah state `users[]` yang bisa di-CRUD, tambah fungsi `addUser`, `updateUser`, `deleteUser`, `resetPassword`. Tambah mock user operator
- `src/components/AppSidebar.tsx` dan `src/components/MobileNav.tsx` -- tambah role `'operator'` ke menu Siswa
- `src/pages/Settings.tsx` -- tambah tab "Pengguna" dengan tabel dan dialog CRUD

---

### Fitur 2: Profil Sekolah Diperkaya (Tab "Sekolah")

Menambahkan field baru ke tab Sekolah yang sudah ada:

- **Logo Sekolah**: upload gambar (disimpan sebagai base64/data URL di state, ditampilkan di preview kop kwitansi)
- **Tahun Ajaran Aktif**: input text (misalnya "2024/2025"), disimpan di SchoolInfo
- **Manajemen Kelas**: daftar kelas yang bisa ditambah/hapus (menggantikan konstanta `CLASSES` yang hardcoded)

**Perubahan terkait:**
- `src/pages/Settings.tsx` -- tambah field logo (input file + preview), tahun ajaran aktif, dan bagian kelola kelas di tab "Sekolah"
- `src/types/spp.ts` -- `CLASSES` tetap sebagai default, tapi kelas sekarang bisa dikelola via state
- `src/contexts/DataContext.tsx` -- tambah state `classes` dan `schoolInfo` + fungsi `addClass`, `deleteClass`, `updateSchoolInfo` agar bisa dipakai di seluruh aplikasi (misalnya kop kwitansi saat cetak)
- Tab "Kwitansi" -- preview kop kwitansi menampilkan logo jika ada

---

### Fitur 3: Pindahkan Info Login & Password ke Pengaturan

- Info demo akun dan form ganti password sudah ada di tab "Akun" -- ini dipertahankan
- Pastikan tab "Akun" juga menampilkan role user yang sedang login (read-only)

---

### Detail Teknis

**File yang diubah:**

| File | Perubahan |
|------|-----------|
| `src/types/spp.ts` | Tambah `'operator'` ke `UserRole`, update `ROLE_LABELS`, tambah interface `SchoolInfo` |
| `src/contexts/AuthContext.tsx` | Tambah state `users[]`, fungsi `addUser`, `updateUser`, `deleteUser`, `resetPassword`. Expose via context |
| `src/contexts/DataContext.tsx` | Tambah state `classes[]`, `schoolInfo`, `receiptHeader`. Fungsi `addClass`, `deleteClass`, `updateSchoolInfo`, `updateReceiptHeader` |
| `src/pages/Settings.tsx` | Refactor besar: tambah tab "Pengguna" (tabel user + dialog CRUD), perkaya tab "Sekolah" (logo, tahun ajaran, kelola kelas), update preview kwitansi dengan logo |
| `src/components/AppSidebar.tsx` | Tambah `'operator'` ke roles menu Siswa |
| `src/components/MobileNav.tsx` | Tambah `'operator'` ke roles menu Siswa |

**Struktur role & permission:**

| Menu | Admin | Bendahara | Operator | Wali |
|------|-------|-----------|----------|------|
| Dashboard | Ya | Ya | Tidak | Ya |
| Siswa | Ya | Ya | Ya | Tidak |
| Tagihan | Ya | Ya | Tidak | Tidak |
| Pembayaran | Ya | Ya | Tidak | Tidak |
| Riwayat | Ya | Ya | Tidak | Ya |
| Laporan | Ya | Ya | Tidak | Tidak |
| Pengaturan | Ya | Tidak | Tidak | Tidak |

**Catatan:** Semua data masih disimpan di state (mock/in-memory). Belum ada backend/database. Jika nanti ingin menyimpan ke Supabase, arsitektur context ini sudah siap untuk dimigrasi.
