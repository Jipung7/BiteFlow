# Alur Kerja & Rencana Bertahap (Roadmap): BiteFlow

Agar proses pembuatan BiteFlow berjalan **efektif dan efisien** (tidak membuang waktu pada hal yang belum perlu), pengembangan dibagi ke dalam **4 Fase Terarah**.

Filosofi kita adalah: **"Build small, test fast"** (Buat yang paling mendasar dulu, pastikan bisa dipakai, baru tambahkan fitur canggih).

---

## 1. Ringkasan Roadmap 4 Fase

```
[FASE 1: Fondasi & Desain UI/UX]  ──>  [FASE 2: Core Engine Recorder & Player]
- Desain antarmuka (wireframe)         - Ekstensi Chrome rekam 30 detik
- Setup repo & database dasar          - Web player sederhana (play/pause)
                    │
                    ▼
[FASE 4: Polishing & Peluncuran]   <──  [FASE 3: Fitur Cerdas (The Magic)]
- Fitur blur data sensitif             - Auto-Zoom kursor ke tombol
- Komentar sticky note di layar        - Smart Grouping (gabung klik beruntun)
- Rilis ke Chrome Web Store            - Sinkronisasi kartu langkah & video
```

---

## Rincian Tiap Fase

### FASE 1: Fondasi, Desain UI/UX & Setup Proyek
* **Target Waktu:** Minggu 1
* **Tujuan:** Memiliki gambaran visual yang jelas dan fondasi kode yang siap dikerjakan.
* **Tugas Spesifik:**
  1. **Desain Layar (Wireframe):**
     * Desain popup ekstensi Chrome (posisi tombol rekam, timer 60 detik).
     * Desain halaman web penonton (tata letak video di kiri, kartu langkah di kanan).
  2. **Inisialisasi Proyek di Folder `AppIdea1`:**
     * Inisialisasi arsitektur web viewer.
     * Inisialisasi manifest & background worker untuk Chrome Extension.
  3. **Setup Penyimpanan:**
     * Skema IndexedDB lokal dan model retensi 7-hari.
* **Hasil Akhir Fase 1:** Rancangan tampilan visual dan fondasi folder kode yang terstruktur.

---

### FASE 2: Perekam Layar Dasar & Pemutar Web (Core MVP)
* **Target Waktu:** Minggu 2–3
* **Tujuan:** Merekam tab aktif di Chrome dan hasilnya dapat ditonton langsung.
* **Tugas Spesifik:**
  1. **Ekstensi Chrome (Perekaman MV3 Offscreen):**
     * Menggunakan `chrome.tabCapture` dan MediaRecorder di offscreen document.
     * Merekam koordinat klik kursor mouse dan timestamp waktu saat klik terjadi.
     * Batas maksimal otomatis berhenti di detik ke-60.
  2. **Penyimpanan Lokal & Ekspor:**
     * Penyimpanan IndexedDB lokal (`BiteFlowStorage`).
     * Ekspor berkas mandiri `.html` portabel.
  3. **Pemutar Web Sederhana:**
     * Halaman viewer dua kolom interaktif.
* **Hasil Akhir Fase 2:** Aplikasi berfungsi end-to-end: merekam layar, menyimpan data, dan memutar panduan.

---

### FASE 3: Fitur Cerdas (Smart Grouping & Auto-Zoom)
* **Target Waktu:** Minggu 4
* **Tujuan:** Pengalaman penonton yang dinamis dan fokus pada konteks klik.
* **Tugas Spesifik:**
  1. **Logika Smart Grouping:**
     * Deteksi klik berurutan pada elemen yang sama dalam jendela waktu singkat.
  2. **Pemutar Kartu Langkah (Interactive Step List):**
     * Kartu langkah bernomor dengan penyuntingan inline dan pengurutan manual (▲/▼).
     * Sinkronisasi klik kartu ke timestamp video terkait.
  3. **Efek Auto-Zoom Kursor:**
     * Transformasi skala 1.6x dengan cubic-bezier menuju koordinat klik saat timestamp mendekati event.
* **Hasil Akhir Fase 3:** Sinkronisasi video, auto-zoom, dan kartu langkah interaktif berfungsi penuh.

---

### FASE 4: Sensor Privasi, Kolaborasi & Rilis
* **Target Waktu:** Minggu 5
* **Tujuan:** Keamanan data privasi dan kemasan rilis mandiri.
* **Tugas Spesifik:**
  1. **Privacy Blur Tool:**
     * Kotak sensor blur berbasis durasi (`startSec` hingga `endSec`).
  2. **Canvas Pixel Burn-In:**
     * Pemrosesan video frame-by-frame via offscreen canvas untuk menghancurkan piksel sensitif secara permanen sebelum dibagikan.
  3. **Public Web Viewer & Retensi 7 Hari:**
     * Antarmuka web mandiri di `web/` dengan banner hitung mundur retensi.
  4. **Publikasi Gratis via GitHub Releases:**
     * Pengemasan ekstensi siap muat dan dokumentasi instalasi.
* **Hasil Akhir Fase 4:** BiteFlow siap didistribusikan ke publik secara mandiri.

---

## 2. Prinsip Kerja Harian Kita
1. **Selalu Terisolasi:** Semua kode, aset, dan berkas hanya boleh berada di dalam folder `AppIdea1/`.
2. **Commit Sering:** Setiap menyelesaikan 1 fungsi kecil, catat perubahan secara disiplin.
3. **Fokus ke Pengalaman Pengguna:** Antarmuka harus langsung dipahami tanpa memerlukan dokumentasi yang rumit.
