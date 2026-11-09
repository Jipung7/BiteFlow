# BiteFlow

<p align="center">
  <a href="https://github.com/Jipung7/biteflow/releases/latest"><img src="https://img.shields.io/badge/Release-v1.0.0-6366f1?style=flat-square" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-emerald?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/Jipung7"><img src="https://img.shields.io/badge/Author-Jipung-0078d4?style=flat-square&logo=github" alt="Author"></a>
  <a href="https://github.com/Jipung7/biteflow/discussions"><img src="https://img.shields.io/badge/Community-Discussions-8b5cf6?style=flat-square&logo=github" alt="Discussions"></a>
</p>

Alat dokumentasi asinkron modern: Mengubah 30–60 detik rekaman layar peramban menjadi panduan langkah-demi-langkah interaktif dengan efek auto-zoom dinamis, sensor privasi waktu, dan pemutar web mandiri.

---

## Masalah & Solusi

- **Masalah:**
  - Pertemuan daring sinkron (Google Meet / Zoom) terlalu sering diadakan hanya untuk menjawab pertanyaan operasional berdurasi 1 menit.
  - Video rekaman layar konvensional (Loom / OBS) memakan waktu lama untuk ditonton dan sulit dibaca pada detail tombol kecil.
  - Dokumentasi tangkapan layar manual (Scribe / Screenshot satu per satu) memakan waktu pembuatan yang melelahkan.
- **Solusi BiteFlow:**
  - Pengguna merekam alur kerja peramban selama 30–60 detik.
  - Sistem menangkap klik mouse dan otomatis menghasilkan **Video Auto-Zoom** yang sinkron dengan **Kartu Langkah Kerja Bernomor**.
  - Rekan kerja atau penerima panduan dapat memilih: menonton video ringkas atau membaca kartu langkah dalam 10 detik.

---

## Fitur Utama

1. **Perekaman Tab Persisten (Manifest V3 Offscreen + TabCapture)**:
   - Perekaman tidak terputus saat pengguna berpindah halaman di dalam tab yang sama.
   - Tanpa dialog pemilih jendela OS yang membingungkan.
2. **Auto-Zoom Koordinat Dinamis**:
   - Pemutar otomatis memperbesar tampilan 1.6x dan memusatkan kamera ke titik koordinat klik kursor saat mendekati momen interaksi.
3. **Editor Langkah Terintegrasi**:
   - Penyuntingan teks judul dan rincian langkah secara inline.
   - Pengurutan langkah naik/turun ([▲]/[▼]) dan penambahan langkah baru pada timestamp berjalan.
4. **Sensor Privasi Berbasis Waktu (Time-Ranged Privacy Blur)**:
   - Kotak sensor dapat digambar langsung di atas area video.
   - Mendukung rentang detik awal (`startSec`) dan detik akhir (`endSec`). Sensor otomatis menghilang saat durasi tampilan data rahasia selesai.
5. **Bakar Sensor Permanen (Canvas Pixel Burn-in)**:
   - Menghancurkan piksel sensitif secara permanen sebelum video dibagikan ke publik, mencegah informasi rahasia diintip melalui *Inspect Element* peramban.
6. **Ekspor Mandiri & Pemutar Web 7-Hari**:
   - Ekspor berkas `.html` portabel mandiri tanpa dependensi internet.
   - Pemutar web publik responsif dua kolom dengan banner hitung mundur retensi 7 hari.

---

## Struktur Direktori

```text
biteflow/
├── .github/
│   └── workflows/
│       └── release.yml          # Otomasi validasi CI dan pembuatan paket rilis
├── extension/                   # Sumber kode Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── background/service-worker.js
│   ├── content/
│   ├── offscreen/
│   ├── popup/
│   ├── preview/
│   └── web/                     # Web player terintegrasi lokal
├── web/                         # Sumber kode Public Web Viewer (Cloudflare Pages ready)
│   ├── css/
│   ├── demo/
│   ├── js/
│   ├── v/
│   └── index.html
├── docs/                        # Dokumentasi teknis & spesifikasi produk
│   ├── 00_ENGINEERING_STANDARDS.md
│   ├── 01_PRODUCT_SPEC.md
│   ├── 02_TECH_STACK.md
│   ├── 03_ROADMAP_WORKFLOW.md
│   └── 04_UI_WIREFRAME.md
├── scripts/
│   ├── check-syntax.js          # Validator sintaks JavaScript zero-dependency
│   ├── build-zip.js             # Skrip pembuat zip rilis
│   └── create-icons.js          # Pembuat ikon PNG
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── README.md
```

---

## Panduan Instalasi (Mode Pengembang)

BiteFlow dapat dipasang di Google Chrome, Microsoft Edge, Brave, atau peramban Chromium lainnya tanpa biaya lisensi toko:

1. Unduh atau clone repositori ini:
   ```bash
   git clone https://github.com/Jipung7/biteflow.git
   ```
2. Buka halaman ekstensi di peramban:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Aktifkan sakelar **Developer mode** (Mode Pengembang) di sudut kanan atas.
4. Klik tombol **Load unpacked** (Muat yang belum dibongkar) dan pilih folder `extension/`.
5. Ikon BiteFlow akan muncul di toolbar dan siap digunakan.

---

## Verifikasi & Pengemasan Rilis

Proyek ini tidak memerlukan dependensi eksternal (zero-dependency build). Seluruh skrip berjalan dengan Node.js bawaan:

```bash
# Validasi sintaks seluruh berkas JavaScript
node scripts/check-syntax.js

# Buat berkas paket zip rilis untuk Chrome Web Store / GitHub Release
node scripts/build-zip.js
```

Paket rilis akan dibuat di direktori `dist/biteflow-extension-v1.0.0.zip`.

---

## Kontribusi & Dukungan

Menemukan kendala atau memiliki saran fitur baru?
- Laporkan langsung melalui [GitHub Issues](https://github.com/Jipung7/biteflow/issues).
- Gabung diskusi di [GitHub Discussions](https://github.com/Jipung7/biteflow/discussions).

---

## Pembuat & Lisensi

Dibuat dengan sepenuh hati oleh **[Jipung](https://github.com/Jipung7)** (*Lone Steed Studio*).

Proyek ini dilisensikan di bawah lisensi terbuka [MIT License](LICENSE). Bebas digunakan, dimodifikasi, dan didistribusikan.
