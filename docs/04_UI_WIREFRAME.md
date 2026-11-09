# Rancangan Antarmuka & Wireframe: BiteFlow

Dokumen ini menjelaskan rancangan tata letak visual (wireframe) untuk 3 layar utama BiteFlow, filosofi desain di balik setiap elemen, serta interaksi antar komponen.

> Pratinjau Interaktif: Berkas prototipe HTML dapat dibuka di `AppIdea1/mockup/index.html`.

---

## 1. Layar 1: Pop-up Ekstensi Browser (The Recorder)
Ukuran jendela: `340px x 450px` (pop-up saat ikon di toolbar browser diklik).

### Diagram Tata Letak (Wireframe):
```text
+-------------------------------------------------+
|  [BiteFlow]                         [Pengaturan]|
+-------------------------------------------------+
|                                                 |
|              Durasi Maksimal: 60 Detik          |
|                                                 |
|                 +-------------+                 |
|                 |    ( * )    |                 |
|                 | MULAI REKAM |                 |
|                 +-------------+                 |
|                                                 |
|   [X] Rekam Tab           [X] Tangkap Klik      |
|                                                 |
+-------------------------------------------------+
|  RIWAYAT REKAMAN TERAKHIR                       |
|  * Panduan Ganti Foto Profil   (28s) [Buka]     |
|  * Lapor Bug Tombol Bayar      (14s) [Buka]     |
+-------------------------------------------------+
```

### Filosofi Desain:
* **Tombol Rekam Tunggal:** Satu klik langsung memulai alur perekaman tanpa konfigurasi berbelit.
* **Batas Waktu Eksplisit:** Mendorong dokumentasi yang padat dan fokus pada inti instruksi.
* **Akses Riwayat Lokal:** Rekaman sebelumnya langsung dapat diakses dan dihapus dari penyimpanan peramban.

---

## 2. Layar 2: Kontrol Mengambang Saat Merekam (Floating HUD)
Elemen antarmuka minimalis yang melayang di pojok layar saat perekaman tab berlangsung.

### Diagram Tata Letak (Wireframe):
```text
+--------------------------------------------------------+
|  REC [ 00:24 / 01:00 ]   [ Pause ]   [ SELESAI ]       |
+--------------------------------------------------------+
```

### Filosofi Desain:
* **Non-Intrusif:** Bentuk pil ramping yang tidak menghalangi area interaksi utama pengguna.
* **Idempoten:** Tombol selesai mengunci status perekaman untuk mencegah pembuatan tab ganda.

---

## 3. Layar 3: Pemutar Ganda & Editor Langkah (Dual-Mode Player)
Antarmuka hasil rekaman dan penonton publik.

### Diagram Tata Letak (Wireframe):
```text
+---------------------------------------------------------------------------------------+
| [BiteFlow]  Tutorial Ganti Foto Profil (32 Detik)         [Unduh WebM] [Simpan HTML]  |
+---------------------------------------------------------------------------------------+
|                                           |                                           |
|  [ SISI KIRI: PEMUTAR VIDEO & AUTO-ZOOM ] |  [ SISI KANAN: KARTU LANGKAH KERJA ]      |
|                                           |                                           |
|  +-------------------------------------+  |  LANGKAH 1 (00:04)                        |
|  |                                     |  |  [▲][▼] Buka Menu Profil                  |
|  |            [PEMUTAR VIDEO]          |  |  Klik ikon akun di sudut kanan atas.      |
|  |                                     |  |  ---------------------------------------  |
|  |      (Auto-zoom 1.6x ke titik klik) |  |                                           |
|  |                                     |  |  LANGKAH 2 (00:18)  <-- AKTIF             |
|  +-------------------------------------+  |  [▲][▼] Unggah Foto Baru                  |
|  [>] 00:12 / 00:32 ----------o------- [F] |  Pilih berkas JPG/PNG lalu simpan.        |
|                                           |                                           |
|  [+ Sensor Privasi]  [Auto-Zoom: Aktif]   |  [+ Tambah Langkah Baru]                  |
+---------------------------------------------------------------------------------------+
```

### Filosofi Desain:
* **Sinkronisasi Bidirectional:** Klik pada kartu langkah melompatkan pemutar video ke timestamp bersangkutan; pergerakan video menyorot kartu langkah aktif.
* **Stage Tunggal Koordinat:** Elemen video, lapisan sensor privasi, dan penanda klik berada dalam satu pembungkus transform sehingga koordinat tidak bergeser saat zoom atau scroll.
