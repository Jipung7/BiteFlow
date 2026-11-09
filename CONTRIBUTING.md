# Panduan Kontribusi (Contributing Guide)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada BiteFlow. Proyek ini memegang teguh standar rekayasa *Human Craftsman* yang pragmatis, minim distraksi, dan teruji.

---

## 1. Standar Penulisan Kode & Komunikasi

Sebelum mengajukan Pull Request, pastikan kontribusi Anda mematuhi panduan di `docs/00_ENGINEERING_STANDARDS.md`:
- **Nol Emoji (Zero Emoji):** Jangan sertakan emoji dalam kode, komentar, commit message, maupun dokumentasi.
- **Komentar Efektif:** Tulis komentar untuk menjelaskan *WHY* (alasan arsitektural/edge cases), bukan *WHAT* (menarasikan ulang apa yang dilakukan baris kode).
- **Tanpa Stub Palsu:** Hindari fungsi kosong atau janji palsu `// TODO: implement later`. Semua fitur harus berfungsi end-to-end.
- **Konvensi Commit:** Gunakan format standar industri:
  - `feat: [deskripsi fitur baru]`
  - `fix: [deskripsi perbaikan bug]`
  - `refactor: [perbaikan struktur tanpa mengubah fungsionalitas]`
  - `docs: [pembaruan dokumentasi]`

---

## 2. Alur Pengembangan Lokal

1. **Clone repository:**
   ```bash
   git clone https://github.com/Jipung7/biteflow.git
   cd biteflow
   ```

2. **Validasi sintaks:**
   ```bash
   npm run check
   ```

3. **Memuat ekstensi di browser:**
   - Buka `chrome://extensions` di Google Chrome atau Chromium.
   - Aktifkan **Developer mode**.
   - Klik **Load unpacked** dan arahkan ke folder `extension/`.

4. **Membuat paket rilis ZIP:**
   ```bash
   npm run build:zip
   ```
   Berkas keluaran akan tersedia di folder `dist/biteflow-extension-v1.0.0.zip`.

---

## 3. Pengajuan Pull Request

1. Buat branch baru dari `main` dengan nama deskriptif (`fix-offscreen-timing` atau `feat-comment-pill`).
2. Jalankan validasi sintaks sebelum commit.
3. Tulis ringkasan perubahan secara lugas pada deskripsi PR tanpa basa-basi atau kata-kata klise.
