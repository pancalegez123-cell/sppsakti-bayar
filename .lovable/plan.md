
## Perbaikan Menu Data Siswa

### Masalah
- Menu "Siswa" tidak ada di navigasi mobile (MobileNav) - hanya ada di sidebar desktop
- Pengguna yang mengakses dari HP tidak bisa melihat atau mengakses halaman Data Siswa

### Solusi

#### 1. Tambah menu Siswa di MobileNav
- Tambahkan item "Siswa" dengan icon Users ke daftar navigasi mobile
- Karena navigasi mobile maksimal 5 item dan sudah ada 5 (Dashboard, Tagihan, Bayar, Riwayat, Laporan), perlu direorganisasi menjadi 6 item atau gunakan menu "More" untuk item tambahan
- Alternatif: ganti urutan agar Siswa masuk dalam 5 item utama, misalnya: Dashboard, Siswa, Tagihan, Bayar, Riwayat (Laporan bisa diakses dari tempat lain)

#### 2. Pastikan halaman Students berfungsi penuh
- Halaman Students (`src/pages/Students.tsx`) sudah punya fitur lengkap: tambah manual, impor file, hapus massal
- Hanya perlu memastikan halaman ini terhubung dengan DataContext

### Detail Teknis

**File yang diubah:**
- `src/components/MobileNav.tsx` - Tambahkan item navigasi "Siswa" dengan path `/students`, icon `Users`, roles `['admin', 'bendahara']`. Reorganisasi urutan item agar muat 5 item utama termasuk Siswa
