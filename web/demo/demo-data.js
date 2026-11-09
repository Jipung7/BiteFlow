// BiteFlow Demo Sample Dataset
// Digunakan untuk verifikasi instan pemutar web tanpa memerlukan upload backend.

window.BITEFLOW_DEMO_DATA = {
  id: 'demo-sample-01',
  title: 'Cara Mengatur Notifikasi Akun & Sensor Informasi Pribadi',
  duration: 18,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  // Video placeholder SVG canvas / sample data stream
  videoUrl: '', 
  blurAreas: [
    {
      id: 'blur-1',
      x: 35,
      y: 40,
      w: 30,
      h: 18,
      startSec: 2,
      endSec: 10
    }
  ],
  steps: [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Buka Menu Pengaturan Akun',
      detail: 'Klik ikon roda gigi di sudut kanan atas dashboard untuk membuka preferensi profil.',
      timestamp: 2,
      clickX: 0.82,
      clickY: 0.12
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Sensor Nomor Telepon Pribadi',
      detail: 'Area nomor telepon disensor secara otomatis selama 8 detik untuk melindungi kerahasiaan data.',
      timestamp: 5,
      clickX: 0.48,
      clickY: 0.46
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Pilih Tab Notifikasi & Email',
      detail: 'Arahkan kursor dan klik submenu Notifikasi untuk mengaktifkan ringkasan berkala.',
      timestamp: 11,
      clickX: 0.28,
      clickY: 0.35
    },
    {
      id: 'step-4',
      stepNumber: 4,
      title: 'Simpan Perubahan',
      detail: 'Klik tombol Simpan di bagian bawah untuk menerapkan seluruh pengaturan baru.',
      timestamp: 15,
      clickX: 0.65,
      clickY: 0.85
    }
  ]
};
