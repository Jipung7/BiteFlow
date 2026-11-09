# Pilihan Teknologi & Arsitektur: BiteFlow

Bagi tim kecil atau pemula, kunci memilih teknologi adalah: **Jangan terlalu rumit, gunakan satu bahasa yang sama dari awal sampai akhir, dan manfaatkan layanan gratis/murah yang sudah terbukti andal.**

Berikut adalah rincian teknologi yang dipilih untuk BiteFlow beserta alasan sederhananya:

---

## 1. Bahasa Pemrograman Utama

### **TypeScript (JavaScript Modern)**
* **Kenapa dipilih?**
  * Ekstensi browser Google Chrome **wajib** menggunakan JavaScript/TypeScript.
  * Web frontend dan server backend juga bisa dibuat menggunakan TypeScript.
  * **Manfaat besar:** Kita hanya perlu belajar dan menggunakan **1 bahasa pemrograman** untuk seluruh aplikasi (tidak perlu campur-campur Python, PHP, atau Java).
  * Menghindari banyak error konyol (seperti salah ketik variabel) sebelum aplikasi dijalankan.

---

## 2. Rincian Komponen Aplikasi (Architecture Stack)

BiteFlow terbagi menjadi 3 bagian utama:

```
[Bagian 1: Perekam]          [Bagian 2: Web Player]        [Bagian 3: Penyimpanan]
Chrome Extension             Next.js + Tailwind CSS        Supabase + Cloudflare R2
(Merekam klik & layar)  ──>  (Menampilkan video & kartu)──>(Database data & video)
```

### A. Bagian 1: Ekstensi Perekam (Chrome Extension)
* **Framework:** **Plasmo** (atau Vite + React)
  * *Penjelasan sederhana:* Membuat ekstensi Chrome biasa sering kali membingungkan karena struktur berkasnya yang kuno. **Plasmo** adalah framework modern yang membuat proses pembuatan ekstensi semudah membuat website React.
* **Alat Rekam Layar:** **Browser MediaStream & MediaRecorder API**
  * *Penjelasan sederhana:* Ini adalah teknologi bawaan browser Chrome untuk merekam video dan suara tanpa perlu menginstal aplikasi tambahan di komputer pengguna.
* **Pelacak Klik (Click Tracker):** JavaScript Event Listener (`mousedown`) untuk mencatat letak koordinat kursor `(X, Y)` dan waktu kejadian secara presisi.

### B. Bagian 2: Web Dashboard & Video Player (Frontend Web)
* **Framework Web:** **Next.js (React)**
  * *Kenapa dipilih?* Standar industri untuk web modern. Halaman memuat super cepat, bagus untuk SEO, dan mendukung pembuatan link publik yang bisa langsung ditonton siapa saja tanpa harus install apa-apa.
* **Tampilan / Desain:** **Tailwind CSS**
  * *Kenapa dipilih?* Menulis tampilan desain jadi sangat cepat tanpa perlu menulis file CSS terpisah yang berantakan. Tampilan otomatis rapi di layar laptop maupun layar HP (*responsive*).
* **Komponen Ikon:** **Lucide Icons**
  * Ikon modern, bersih, dan ringan untuk tombol Play, Pause, Step, Share, dll.

### C. Bagian 3: Penyimpanan & Database (Backend & Cloud)
* **Database & Akun Pengguna:** **Supabase** (PostgreSQL)
  * *Kenapa dipilih?* 
    * Menyediakan database relasional yang kuat, sistem login (Google/Email), dan API otomatis tanpa kita harus membuat server backend dari nol.
    * Memiliki paket gratis (*free tier*) yang sangat memadai untuk tahap awal.
* **Penyimpanan Video & Gambar:** **Cloudflare R2** (atau Supabase Storage)
  * *Kenapa dipilih?* 
    * Menyimpan file video WebM dan screenshot membutuhkan tempat penyimpanan berkas (*object storage*).
    * Cloudflare R2 gratis biaya transfer data (*zero egress fees*).
    * **Strategi Hapus Otomatis (7-Day TTL):** Semua berkas video disetel memiliki masa kedaluwarsa 7 hari secara otomatis. Dengan cara ini, kuota gratis 10 GB tidak akan pernah penuh dan biaya operasional kita selamanya tetap Rp 0.

---

## 3. Estimasi Biaya Tahap Awal (100% GRATIS / $0)

Proyek ini dirancang agar **bebas biaya modal (Zero Cost)** dengan memanfaatkan layanan gratis dan distribusi terbuka:
1. **GitHub:** Gratis (untuk simpan source code & distribusi rilis aplikasi via GitHub Releases).
2. **Distribusi Ekstensi:** Gratis (pengguna cukup download berkas `.zip` lalu pasang via "Developer Mode" di Chrome, atau rilis gratis di Microsoft Edge Add-ons Store).
3. **Vercel:** Gratis (untuk hosting web player Next.js).
4. **Supabase:** Gratis (hingga 500 MB database & autentikasi pengguna).
5. **Cloudflare R2:** Gratis (hingga 10 GB penyimpanan video/gambar).

**Total Biaya Modal: Rp 0 ($0)**.

---

## 4. Struktur Database Sederhana

Untuk gambaran awal, sistem ini hanya butuh 4 tabel utama:

1. **`users`** : Menyimpan data pemilik akun (id, email, nama).
2. **`recordings`** : Menyimpan data rekaman (id, user_id, judul, link_video, total_durasi, tanggal).
3. **`steps`** : Menyimpan data tiap langkah/milestone (id, recording_id, urutan, judul_langkah, waktu_detik, url_screenshot, posisi_kursor_x_y).
4. **`comments`** : Menyimpan komentar di layar (id, recording_id, posisi_x_y, isi_teks, nama_pengirim).

---

## 5. Rencana Migrasi ke Aplikasi Mandiri (Desktop App) Tanpa Bikin Ulang

Jika di masa depan kita ingin membuat BiteFlow menjadi aplikasi mandiri untuk Windows (`.exe`) atau Mac:
* **Tidak Perlu Tulis Ulang Kode:** Seluruh tampilan antarmuka (komponen kartu, pemutar video, styling Tailwind) dan logika database Supabase bisa 100% digunakan kembali.
* **Pembungkus Desktop (Tauri / Electron):** Kita hanya perlu menambahkan konfigurasi **Tauri** (berbasis Rust, sangat ringan ~15 MB) untuk mengemas kode web kita menjadi file installer desktop `.exe`.
* **Keuntungan Strategi Ini:** Memulai dari ekstensi browser adalah langkah paling cepat dan hemat modal untuk validasi pasar, tanpa menutup pintu untuk berkembang menjadi aplikasi desktop mandiri kelak.
