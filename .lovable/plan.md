
Tujuan: menghubungkan aplikasi ini ke Supabase dengan migrasi penuh untuk auth + data, sambil menjaga pola role yang sudah ada: admin, bendahara, operator, wali.

Yang saya temukan dari kode sekarang:
- Belum ada integrasi Supabase sama sekali.
- Login masih mock di `src/contexts/AuthContext.tsx` dengan password disimpan di state.
- Data siswa, tagihan, pembayaran, profil sekolah, kelas masih di `src/contexts/DataContext.tsx`.
- Route protection masih berbasis `isAuthenticated` lokal di `src/components/AppLayout.tsx`.
- Beberapa halaman masih membaca `mockData` langsung, misalnya `PaymentHistory.tsx`, jadi nanti perlu dirapikan agar semua data datang dari backend.
- User sudah memutuskan:
  - Supabase project baru
  - Migrasi awal: auth + data penuh
  - Pembuatan akun: admin buat user

Rencana implementasi

1. Hubungkan project ke Supabase
- Sambungkan project ini ke Supabase project baru.
- Tambahkan client Supabase di frontend.
- Siapkan konfigurasi URL/key dari koneksi resmi project, bukan hardcode manual.

2. Bangun arsitektur database yang aman
Saya akan pakai struktur yang sesuai kebutuhan aplikasi ini, dengan penyesuaian dari model sekarang:
- `profiles` untuk profil user
- `user_roles` terpisah untuk role
- `schools`
- `classes`
- `receipt_headers`
- `spp_settings`
- `students`
- `bills`
- `payments`

Catatan penting:
- Role tidak akan disimpan di tabel profile utama sebagai sumber kebenaran.
- Role final tetap di `user_roles` agar aman dan sesuai best practice.
- `profiles` hanya menyimpan data profil user.

3. Atur auth Supabase
- Ganti login mock di `AuthContext` menjadi session Supabase Auth.
- Gunakan listener auth state untuk sinkron session.
- Logout akan memakai Supabase auth logout.
- Hapus ketergantungan pada password lokal/mock.
- Karena user dibuat admin, pembuatan akun akan dilakukan lewat Edge Function/admin flow, bukan self-signup publik.

4. Siapkan RBAC dan RLS
- Buat enum role: `admin`, `bendahara`, `operator`, `wali`.
- Buat tabel `user_roles`.
- Buat helper functions security definer seperti:
  - `has_role`
  - fungsi cek akses sekolah
  - fungsi cek wali terhadap siswa/bill/payment
- Terapkan RLS per tabel supaya:
  - admin akses penuh
  - bendahara fokus ke pembayaran/tagihan/laporan dan data terkait
  - operator hanya data siswa
  - wali hanya data miliknya sendiri

5. Migrasikan konteks frontend ke Supabase
- `AuthContext` menjadi wrapper session + profile + role dari Supabase.
- `DataContext` diubah dari `useState` menjadi fetch/mutation ke Supabase.
- Semua operasi CRUD siswa, tagihan, pembayaran, profil sekolah, kelas, header kwitansi akan lewat query Supabase.
- Saya juga akan menyamakan tipe TypeScript dengan struktur tabel baru.

6. Rapikan halaman yang masih memakai mock data
Beberapa halaman belum konsisten memakai context/backend. Ini perlu dibersihkan agar tidak campur mock dan database:
- `Dashboard`
- `PaymentHistory`
- kemungkinan beberapa halaman lain yang masih import `mockData`
Semua halaman akan diarahkan ke data Supabase yang sama.

7. Pembuatan user oleh admin
Karena Anda memilih “admin buat user”, saya akan rancang alur ini:
- Admin membuka Pengaturan > Pengguna
- Admin isi nama, email, password awal, role
- Frontend memanggil Edge Function yang:
  - membuat user di Supabase Auth
  - membuat `profiles`
  - menambahkan `user_roles`
  - mengaitkan ke sekolah aktif
Ini penting karena client biasa tidak boleh langsung membuat akun user lain secara aman.

8. Storage untuk logo sekolah
- Logo sekolah dipindahkan dari base64 state ke Supabase Storage.
- Bucket dibuat private.
- Admin dapat upload/ganti logo.
- URL/logo disimpan di tabel sekolah atau profile sekolah.

9. Migrasi data awal
- Gunakan mock/default data sekarang sebagai seed awal agar aplikasi tetap langsung terisi.
- Akun demo lokal akan digantikan oleh akun Supabase.
- Data sekolah, kelas, siswa, tagihan, pembayaran, dan header kwitansi bisa dimasukkan sebagai data awal.

10. Pengujian akhir
- Uji login/logout
- Uji pembuatan user oleh admin
- Uji akses per role
- Uji CRUD siswa/tagihan/pembayaran
- Uji wali hanya melihat data sendiri
- Uji upload logo sekolah
- Uji halaman yang sebelumnya masih bergantung pada mock data

Urutan kerja yang saya sarankan
1. Connect Supabase project
2. Buat schema + role tables + helper functions + RLS
3. Buat storage bucket logo
4. Setup auth client + session flow
5. Implement Edge Function untuk create user by admin
6. Refactor `AuthContext`
7. Refactor `DataContext`
8. Migrasikan halaman-halaman utama
9. Seed data awal
10. Test end-to-end per role

Perubahan file yang kemungkinan terdampak
- `src/App.tsx`
- `src/contexts/AuthContext.tsx`
- `src/contexts/DataContext.tsx`
- `src/pages/Login.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Students.tsx`
- `src/pages/Bills.tsx`
- `src/pages/Payments.tsx`
- `src/pages/PaymentHistory.tsx`
- `src/types/spp.ts`
- file util Supabase baru
- migration/schema files
- edge function untuk create user

Keputusan desain yang saya pegang
- Profil user: ya, disimpan terpisah di `profiles`
- Role: wajib di `user_roles`, bukan di profile sebagai sumber utama
- Tidak ada self-registration
- Admin membuat user
- Wali dibatasi ke data anak/siswa yang terhubung
- Mock data akan dihentikan bertahap sampai seluruh app membaca dari Supabase

Hasil akhir yang diharapkan
- Data tidak hilang saat refresh
- Login aman dan berbasis Supabase
- Role & permission berlaku di level database, bukan hanya UI
- Admin bisa kelola user sungguhan
- Aplikasi siap dipakai lintas perangkat, bukan hanya browser lokal

Risiko/hal yang perlu diantisipasi
- Mapping wali ke siswa perlu field relasi yang jelas di tabel `students`
- Halaman yang masih pakai `mockData` bisa terlihat “setengah jalan” jika tidak dimigrasikan sekaligus
- Pembuatan user admin membutuhkan backend-safe flow, jadi Edge Function hampir pasti diperlukan
- Setelah frontend diubah, perlu uji ulang seluruh navigasi role-based

Jika lanjut implementasi, saya akan mulai dari koneksi Supabase dan desain schema aman dulu, lalu refactor auth dan data layer agar aplikasi tidak lagi bergantung pada state lokal.
