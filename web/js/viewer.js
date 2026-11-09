// BiteFlow Public Web Viewer
// Pemutar video interaktif dengan sinkronisasi langkah kerja, auto-zoom, dan sensor privasi waktu.

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const recordId = urlParams.get('v') || urlParams.get('id');
  const isDemo = urlParams.get('demo') === '1' || window.location.hash.includes('demo') || (!recordId && !window.location.hash);

  const videoEl = document.getElementById('player-video');
  const videoStage = document.getElementById('video-stage');
  const errorBox = document.getElementById('video-error-box');
  const errorText = document.getElementById('video-error-text');
  const titleEl = document.getElementById('meta-title');
  const durationEl = document.getElementById('meta-duration');
  const stepsListEl = document.getElementById('steps-list');
  const btnDownloadVideo = document.getElementById('btn-download-video');
  const btnToggleZoom = document.getElementById('btn-toggle-zoom');
  const zoomToggleText = document.getElementById('zoom-toggle-text');
  const clickMarker = document.getElementById('click-marker');
  const blurContainer = document.getElementById('blur-container');
  const expiryBanner = document.getElementById('expiry-banner');
  const expiryText = document.getElementById('expiry-text');

  let autoZoomEnabled = true;
  let activeData = null;
  let activeSteps = [];
  let activeBlurs = [];

  // 1. Pemuatan Data (Hash Fragment / IndexedDB / Backend / Fallback Demo)
  try {
    if (window.location.hash && window.location.hash.startsWith('#data=')) {
      const rawBase64 = window.location.hash.slice(6);
      const jsonStr = decodeURIComponent(escape(atob(rawBase64)));
      activeData = JSON.parse(jsonStr);
    } else if (recordId) {
      activeData = await loadRecordFromStorageOrApi(recordId);
    }

    if (!activeData && isDemo) {
      activeData = window.BITEFLOW_DEMO_DATA;
    }

    if (!activeData) {
      throw new Error('Data rekaman tidak ditemukan atau telah melewati batas 7 hari.');
    }
  } catch (err) {
    showError(err.message || 'Gagal memuat panduan kerja.');
    return;
  }

  // 2. Render Metadata & Informasi Masa Berlaku
  titleEl.textContent = activeData.title || 'Panduan Layar Singkat';
  const durationSec = activeData.duration || 0;
  durationEl.textContent = `00:${String(durationSec).padStart(2, '0')}`;

  renderExpiryBanner(activeData.createdAt, activeData.expiresAt);

  activeSteps = (activeData.steps || []).sort((a, b) => a.timestamp - b.timestamp);
  activeBlurs = (activeData.blurAreas || []).map(b => ({
    ...b,
    startSec: b.startSec !== undefined ? b.startSec : 0,
    endSec: b.endSec !== undefined ? b.endSec : durationSec
  }));

  renderStepsUI();
  renderBlurBoxes();

  // 3. Pemuatan Video
  if (activeData.videoBlob) {
    const videoUrl = URL.createObjectURL(activeData.videoBlob);
    videoEl.src = videoUrl;
    setupDownloadButton(videoUrl, activeData.title);
  } else if (activeData.videoUrl && activeData.videoUrl.length > 0) {
    videoEl.src = activeData.videoUrl;
    setupDownloadButton(activeData.videoUrl, activeData.title);
  } else {
    // Mode Demo Tanpa Video Fisik: Buat canvas synth loop agar penonton bisa mencoba auto-zoom & steps
    synthesizeDemoVideoStream(durationSec);
  }

  videoEl.onerror = () => {
    showError('Format video tidak didukung oleh browser ini. Silakan gunakan tombol unduh.');
  };

  // 4. Sinkronisasi Video: Auto-Zoom, Sensor Privasi, & Langkah Aktif
  videoEl.addEventListener('timeupdate', () => {
    const currentTime = videoEl.currentTime;

    // A. Sinkronisasi Sensor Privasi (Blur Box)
    activeBlurs.forEach((b, idx) => {
      const boxEl = document.getElementById(`web-blur-box-${idx}`);
      if (boxEl) {
        const isVisible = currentTime >= b.startSec && currentTime <= (b.endSec + 0.3);
        boxEl.style.display = isVisible ? 'block' : 'none';
      }
    });

    // B. Sinkronisasi Auto-Zoom
    let matchedStep = null;
    let minDiff = 1.2;

    for (const step of activeSteps) {
      const diff = Math.abs(currentTime - step.timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        matchedStep = step;
      }
    }

    if (autoZoomEnabled && matchedStep && matchedStep.clickX !== undefined && matchedStep.clickY !== undefined) {
      applyZoom(matchedStep.clickX, matchedStep.clickY);
    } else {
      resetZoom();
    }

    // C. Sorot Langkah Aktif di Kolom Kanan
    highlightActiveStep(currentTime);
  });

  videoEl.addEventListener('ended', () => {
    resetZoom();
  });

  // 5. Toggle Auto-Zoom
  btnToggleZoom.addEventListener('click', () => {
    autoZoomEnabled = !autoZoomEnabled;
    if (autoZoomEnabled) {
      btnToggleZoom.classList.add('active');
      zoomToggleText.textContent = 'Auto-Zoom: Aktif';
    } else {
      btnToggleZoom.classList.remove('active');
      zoomToggleText.textContent = 'Auto-Zoom: Nonaktif';
      resetZoom();
    }
  });

  // Fungsi Penerapan Efek Zoom
  function applyZoom(relX, relY) {
    const originX = Math.round(relX * 100);
    const originY = Math.round(relY * 100);
    videoStage.style.transformOrigin = `${originX}% ${originY}%`;
    videoStage.style.transform = 'scale(1.6)';

    clickMarker.style.left = `${originX}%`;
    clickMarker.style.top = `${originY}%`;
    clickMarker.classList.remove('hidden');
  }

  function resetZoom() {
    videoStage.style.transform = 'scale(1)';
    clickMarker.classList.add('hidden');
  }

  // Render Daftar Langkah
  function renderStepsUI() {
    stepsListEl.innerHTML = '';

    if (activeSteps.length === 0) {
      stepsListEl.innerHTML = '<div class="steps-empty">Tidak ada langkah kerja terekam.</div>';
      return;
    }

    activeSteps.forEach((step, idx) => {
      const card = document.createElement('div');
      card.className = 'step-card';
      card.id = `step-card-${idx}`;
      card.onclick = () => {
        videoEl.currentTime = Math.max(0, step.timestamp - 0.2);
        videoEl.play();
      };

      const timeText = `00:${String(Math.floor(step.timestamp)).padStart(2, '0')}`;

      card.innerHTML = `
        <div class="step-card-header">
          <span class="step-number-badge">Langkah ${idx + 1}</span>
          <span class="step-timestamp">${timeText}</span>
        </div>
        <div class="step-title">${escapeHtml(step.title || 'Aktivitas Layar')}</div>
        <div class="step-detail">${escapeHtml(step.detail || 'Interaksi pada elemen antarmuka.')}</div>
      `;

      stepsListEl.appendChild(card);
    });
  }

  // Sorot Langkah Saat Video Berjalan
  function highlightActiveStep(currentTime) {
    let activeIndex = -1;
    for (let i = activeSteps.length - 1; i >= 0; i--) {
      if (currentTime >= activeSteps[i].timestamp - 0.3) {
        activeIndex = i;
        break;
      }
    }

    activeSteps.forEach((_, idx) => {
      const card = document.getElementById(`step-card-${idx}`);
      if (card) {
        if (idx === activeIndex) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      }
    });
  }

  // Render Kotak Sensor Privasi (Blur Box)
  function renderBlurBoxes() {
    blurContainer.innerHTML = '';
    activeBlurs.forEach((b, idx) => {
      const box = document.createElement('div');
      box.id = `web-blur-box-${idx}`;
      box.className = 'blur-box';
      box.style.left = `${b.x}%`;
      box.style.top = `${b.y}%`;
      box.style.width = `${b.w}%`;
      box.style.height = `${b.h}%`;
      box.style.display = 'none';
      blurContainer.appendChild(box);
    });
  }

  // Hitung Masa Aktif 7 Hari
  function renderExpiryBanner(createdAt, expiresAt) {
    let expireDate = null;

    if (expiresAt) {
      expireDate = new Date(expiresAt);
    } else if (createdAt) {
      expireDate = new Date(new Date(createdAt).getTime() + (window.BITEFLOW_CONFIG.RETENTION_MS || 7 * 86400000));
    }

    if (!expireDate || isNaN(expireDate.getTime())) {
      expiryBanner.classList.add('hidden');
      return;
    }

    const now = new Date();
    const diffMs = expireDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      expiryText.textContent = 'Masa berlaku tautan ini telah habis. Berkas tidak lagi dapat diakses.';
      expiryBanner.classList.remove('hidden');
      showError('Tautan telah kedaluwarsa (retensi 7 hari telah berakhir).');
      return;
    }

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    expiryText.textContent = `Tautan publik sementara: Berkas ini akan terhapus otomatis dalam ${diffDays} hari demi privasi.`;
    expiryBanner.classList.remove('hidden');
  }

  function setupDownloadButton(url, title) {
    btnDownloadVideo.onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `BiteFlow-${(title || 'Panduan').replace(/\s+/g, '_')}.webm`;
      a.click();
    };
  }

  function showError(msg) {
    errorBox.classList.remove('hidden');
    errorText.textContent = msg;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Pembacaan Data dari IndexedDB lokal (jika satu origin) atau REST backend
  async function loadRecordFromStorageOrApi(id) {
    // 1. Coba baca dari IndexedDB BiteFlowStorage (berguna saat ditest di origin yang sama)
    const localRecord = await new Promise((resolve) => {
      if (!window.indexedDB) return resolve(null);
      const req = indexedDB.open('BiteFlowStorage', 2);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('recordings')) return resolve(null);
        const tx = db.transaction('recordings', 'readonly');
        const store = tx.objectStore('recordings');
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const rec = getReq.result;
          if (rec) {
            resolve({
              id: rec.id,
              title: rec.title,
              duration: rec.duration,
              videoBlob: rec.blob,
              steps: rec.events || [],
              blurAreas: rec.blurAreas || [],
              createdAt: rec.date
            });
          } else {
            resolve(null);
          }
        };
        getReq.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    });

    if (localRecord) return localRecord;

    // 2. Coba fetch dari backend REST jika dikonfigurasi
    if (window.BITEFLOW_CONFIG.API_BASE_URL) {
      const res = await fetch(`${window.BITEFLOW_CONFIG.API_BASE_URL}/recordings/${id}`);
      if (res.ok) {
        return await res.json();
      }
    }

    return null;
  }

  // Synthesize visual frame stream jika membuka demo tanpa berkas video eksternal
  function synthesizeDemoVideoStream(duration) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(25);
    videoEl.srcObject = stream;

    let startTime = Date.now();
    function drawDemoFrame() {
      const elapsed = ((Date.now() - startTime) / 1000) % (duration || 18);
      
      // Background UI Dashboard Mock
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 1280, 720);

      // Top Navbar Mock
      ctx.fillStyle = '#27272a';
      ctx.fillRect(0, 0, 1280, 60);

      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('BiteFlow Demo Workspace', 30, 36);

      // Gear Icon Mock (Step 1 target)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(1280 * 0.82, 720 * 0.12, 16, 0, Math.PI * 2);
      ctx.fill();

      // Card Container Mock
      ctx.fillStyle = '#27272a';
      ctx.fillRect(100, 120, 1080, 500);

      // Sensitive text info (Step 2 target)
      ctx.fillStyle = '#71717a';
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText('Data Profil Pengguna:', 140, 180);

      ctx.fillStyle = '#ef4444';
      ctx.fillText('Nomor Telepon: +62 812-9988-7766 (Area Sensor Privasi)', 140, 240);

      // Submenu Mock (Step 3 target)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(140, 320, 220, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('Pengaturan Notifikasi', 160, 345);

      // Save Button Mock (Step 4 target)
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(1280 * 0.65 - 80, 720 * 0.85 - 20, 160, 44);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('Simpan Perubahan', 1280 * 0.65 - 65, 720 * 0.85 + 6);

      // Timecode
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px monospace';
      ctx.fillText(`Waktu Simulasi: 00:${String(Math.floor(elapsed)).padStart(2, '0')}`, 30, 700);

      requestAnimationFrame(drawDemoFrame);
    }

    drawDemoFrame();
  }
});
