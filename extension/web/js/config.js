// BiteFlow Web Configuration
// Konfigurasi endpoint publik, penyimpanan sementara (7 hari), dan fallback demo.

window.BITEFLOW_CONFIG = {
  // Mode penyimpanan: 'ephemeral' (default free-tier), 'supabase', atau 'local'
  STORAGE_PROVIDER: 'ephemeral',

  // TTL (Time To Live) retensi berkas: 7 Hari dalam milidetik
  RETENTION_MS: 7 * 24 * 60 * 60 * 1000,

  // Endpoint backend API jika di-deploy ke Cloudflare Workers / Supabase Edge Functions
  // Kosong secara default; jika kosong, viewer membaca dari payload hash, IndexedDB, atau demo data
  API_BASE_URL: '',

  // URL dasar aplikasi viewer
  APP_URL: window.location.origin + window.location.pathname,

  // Fallback demo saat parameter ?demo=1 atau ID tidak ditemukan
  DEMO_ENABLED: true
};
