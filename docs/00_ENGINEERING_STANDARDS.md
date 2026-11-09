# PANDUAN STANDAR REKAYASA KODE & KOMUNIKASI (HUMAN CRAFTSMAN)

Dokumen ini adalah aturan mutlak bagi pengembang dan agen AI dalam menulis kode, berkomunikasi, dan menyusun dokumentasi pada proyek ini. Prinsip utamanya adalah: "Bekerja seperti insinyur senior yang pragmatis—lugas, presisi, minim distraksi, dan bebas dari kebiasaan generik AI."

---

## 1. STANDAR PENULISAN KODE (CLEAN & PRAGMATIC CODE)

### A. Komentar: Jelaskan "WHY", Bukan "WHAT"
- Dilarang menulis komentar sepele yang hanya menarasikan ulang kode.
- Tulis komentar HANYA jika ada alasan arsitektural yang tidak lazim, penanganan edge cases, batasan platform/hardware, atau solusi sementara untuk bug upstream.

### B. Nol Kode Fiktif (Zero Fake Stubs / Mock Palsu)
- Dilarang meninggalkan fungsi kosong dengan janji palsu seperti `// TODO: implement later` atau `throw new Error("Not implemented")`.
- Tulis implementasi nyata yang berfungsi end-to-end.

### C. Hindari Over-Engineering (Prinsip YAGNI & KISS)
- Selesaikan masalah langsung pada akarnya.
- Dilarang membuat lapisan abstraksi berlebih jika masalah bisa diselesaikan dengan fungsi sederhana yang bersih.
- Hindari dependensi pihak ketiga jika API bawaan platform sudah mencukupi.

### D. Preservasi Kode Eksisting (Surgical Edits)
- Jangan merombak kode atau dokumentasi di luar cakupan tugas. Lakukan perubahan secara presisi.

---

## 2. STANDAR BAHASA & KOMUNIKASI (ANTI-AI CLICHÉ)

### A. Blacklist Kata Klise AI
- Dilarang menggunakan kata hiasan generik:
  - English: *delve into, testament, revolutionize, cutting-edge, seamlessly empowers, elevate, tapestry, unleash, meticulously, paramount, beacon, dive deep, game-changer*.
  - Indonesia: *merevolusi, merajut, bukti nyata, memberdayakan secara mulus, meningkatkan ke tingkat berikutnya, mahakarya, membuka potensi penuh*.
- Gunakan bahasa manusia asli yang membumi, teknis, dan to the point.

### B. Tanpa Basa-Basi Template (Zero Sycophancy)
- Hindari kalimat pembuka pujian kosong ("Tentu saja!", "Pertanyaan yang luar biasa!").
- Bersikaplah sebagai rekan kerja senior: langsung masuk ke inti masalah atau laporkan hasil kerja secara terstruktur.

---

## 3. DOKUMENTASI, COMMIT, & CATATAN RILIS

### A. Bebas Polusi Emoji (Zero Emoji Clutter)
- Jangan menaruh rentetan emoji generik di judul atau poin release notes.
- Gunakan teks bersih, tipografi markdown yang rapi, dan konvensi commit standar industri:
  - `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.

### B. Dokumentasi Berbasis Fakta
- Dokumentasi harus mencerminkan kondisi riil sistem saat ini.

---

## 4. VERIFIKASI SEBELUM MELAPORKAN PEKERJAAN
1. Kode harus valid secara sintaks dan tipe data.
2. Alur pesan antar-konteks ekstensi (popup, content, background, offscreen) harus diverifikasi alirannya.
