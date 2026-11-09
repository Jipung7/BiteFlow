# Spesifikasi Produk & Fitur: BiteFlow

Dokumen ini menjelaskan secara rinci bagaimana cara kerja setiap fitur BiteFlow, bagaimana alur perjalanan pengguna (*user flow*), serta aturan fungsionalnya (*functional requirements*).

---

## 1. Alur Perjalanan Pengguna Utama (Core User Flow)

```
[1. PEREKAMAN]
Pengguna klik icon BiteFlow di browser Chrome → Klik "Mulai Rekam" (Max 60 Detik)
                    ↓
Pengguna mengeklik alur di website (misal: isi form, klik tombol login)
                    ↓
Klik "Selesai Rekam" (Stop)
                    ↓
[2. PEMROSESAN OTOMATIS]
Sistem BiteFlow secara otomatis:
- Menyimpan klip video pendek (WebM/MP4)
- Menangkap tangkapan layar (screenshot) saat mouse klik
- Mengelompokkan klik yang mirip menjadi "Milestone Card"
                    ↓
[3. PENERIMAAN / KONSUMSI]
Link dibuat otomatis (contoh: biteflow.io/v/x9d821)
                    ↓
Penerima membuka link:
- Pilihan A: Menonton video 30 detik dengan fitur Auto-Zoom ke tombol
- Pilihan B: Membaca kartu langkah 1, 2, 3 tanpa menyetel video
- Fitur Interaktif: Penerima bisa klik gambar dan meninggalkan catatan revisi langsung di layar
```

---

## 2. Rincian Fitur Utama

### Fitur 1: Ekstensi Perekam (Chrome Extension Recorder)
* **Tujuan:** Perekaman instan tanpa perlu download aplikasi desktop berat.
* **Cara Kerja:**
  * Ikon kecil di pojok kanan atas browser Google Chrome.
  * Pop-up ringkas berisi:
    * Tombol besar merah: **"Mulai Rekam"**.
    * Opsi: Mic aktif / mati.
    * Timer visual lingkaran (hitungan mundur maksimal 60 detik).
  * Saat merekam, skrip merekam dua hal sekaligus:
    1. **Aliran Video:** Apa yang tampak di tab browser.
    2. **Log Peristiwa (Event Tracking):** Koordinat posisi kursor mouse saat mengeklik elemen (`x, y`), nama tag elemen (misal: `<button>`, `<input>`), dan URL halaman.

### Fitur 2: Smart Grouping (Anti-Banjir Langkah)
* **Tujuan:** Menghindari masalah kompetitor (seperti Scribe) yang menghasilkan 20–30 screenshot berantakan.
* **Cara Kerja:**
  * Jika pengguna mengeklik 3 input berturut-turut dalam 5 detik (contoh: Nama Depan, Nama Belakang, Email), sistem menggabungkannya menjadi **1 Kartu Langkah**:
    * *Judul:* "Lengkapi Formulir Profil"
    * *Screenshot:* 1 gambar dengan 3 penanda lingkaran angka (1, 2, 3).
  * Pengguna bisa mengedit judul kartu ini secara manual jika ingin memperjelas instruksi.

### Fitur 3: Pemutar Ganda Cerdas (Interactive Dual-Mode Player)
* **Tujuan:** Memberikan kebebasan kepada penerima link untuk memilih format yang paling nyaman baginya.
* **Tampilan Layar (Web Dashboard):**
  * **Sisi Kiri (Video Auto-Zoom):** Video yang secara otomatis memperbesar (zoom-in) area sekitar kursor saat tombol diklik, sehingga teks tetap terbaca tajam meski dibuka di HP.
  * **Sisi Kanan (Kartu Langkah):** Daftar kartu langkah (Step 1, Step 2, Step 3).
  * **Sinkronisasi Dua Arah:** 
    * Jika pengguna mengeklik kartu "Langkah 2", video di sisi kiri langsung melompat (*seek*) ke detik kejadian Langkah 2.
    * Jika video diputar, kartu langkah di sisi kanan otomatis menyala mengikuti detik yang sedang berjalan.

### Fitur 4: Sensor Privasi Cepat (Quick Blur)
* **Tujuan:** Menjaga kerahasiaan data pengguna (password, alamat, nomor telepon, data nasabah).
* **Cara Kerja:**
  * Input tipe password otomatis disensor buram (*auto-blur*).
  * Pada halaman editor pasca-rekam, pengguna bisa menarik kotak blur (*blur drag tool*) ke area manapun yang tidak boleh dilihat publik.

### Fitur 5: Komentar Pinpoint Langsung di Layar (Annotation Notes)
* **Tujuan:** Menghentikan kebingungan "ini maksudnya di bagian mana?".
* **Cara Kerja:**
  * Penerima cukup mengeklik bagian tertentu di screenshot atau mem-pause video.
  * Muncul kotak *sticky note* kecil untuk mengetik saran atau pertanyaan: *"Tombol ini warnanya belum sesuai desain"*.
  * Pembuat rekaman mendapat notifikasi instan.

### Fitur 6: Penyimpanan Cerdas & Ekspor Fleksibel
* **Model Penyimpanan (Bebas Biaya Server & Tanpa Login):**
  * **Link Online Instan (7 Hari):** Tautan publik dibuat langsung tanpa perlu akun/login. Video disimpan selama 7 hari (model WeTransfer / Snapchat), sangat cocok untuk komunikasi cepat harian dan menjaga kuota server tetap gratis selamanya.
  * **Simpan Permanen (Download Mandiri):** Pada halaman web pemutar, tersedia tombol *"Unduh Berkas Mandiri"* untuk pengguna yang ingin menyimpan rekaman ke komputer mereka selamanya (arsip SOP / dokumentasi abadi).
* **Bisa Dibagikan Sebagai:**
  1. **Web Link Instan:** Siap dikirim via WhatsApp/Slack dalam 1 klik.
  2. **Ekspor Berkas HTML Mandiri:** Bisa dibuka langsung di browser manapun tanpa koneksi server.
  3. **Ekspor Gambar / PDF Rangkuman:** Cocok untuk lampiran dokumentasi tim.
