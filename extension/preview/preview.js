// BiteFlow Preview Controller: IndexedDB Reader, Time-Ranged Privacy Blur, Smart Grouping & Step Editor
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const recordId = urlParams.get('id');

  const videoEl = document.getElementById('player-video');
  const videoWrapper = document.getElementById('video-wrapper');
  const videoStage = document.getElementById('video-stage');
  const errorBox = document.getElementById('video-error-box');
  const titleEl = document.getElementById('meta-title');
  const durationEl = document.getElementById('meta-duration');
  const dateEl = document.getElementById('meta-date');
  const stepsListEl = document.getElementById('steps-list');
  const btnDownloadVideo = document.getElementById('btn-download-video');
  const btnDownloadHtml = document.getElementById('btn-download-html');
  const btnToggleZoom = document.getElementById('btn-toggle-zoom');
  const zoomToggleText = document.getElementById('zoom-toggle-text');
  const clickMarker = document.getElementById('click-marker');
  const btnAddStep = document.getElementById('btn-add-step');
  const btnDeleteRecord = document.getElementById('btn-delete-record');

  // Komponen Sensor Privasi
  const btnToggleBlur = document.getElementById('btn-toggle-blur');
  const blurToggleText = document.getElementById('blur-toggle-text');
  const blurContainer = document.getElementById('blur-container');
  const blurDrawOverlay = document.getElementById('blur-draw-overlay');
  const blurSelectionBox = document.getElementById('blur-selection-box');
  const blurListSection = document.getElementById('blur-list-section');
  const blurItemsList = document.getElementById('blur-items-list');
  const blurCountBadge = document.getElementById('blur-count-badge');

  // Komponen Modal Berbagi Tautan & Bakar Sensor
  const btnShareLink = document.getElementById('btn-share-link');
  const shareModal = document.getElementById('share-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const burninNotice = document.getElementById('burnin-notice');
  const btnBakeSensor = document.getElementById('btn-bake-sensor');
  const burninProgressWrap = document.getElementById('burnin-progress-wrap');
  const burninProgressPct = document.getElementById('burnin-progress-pct');
  const burninProgressFill = document.getElementById('burnin-progress-fill');
  const shareUrlInput = document.getElementById('share-url-input');
  const btnCopyShareUrl = document.getElementById('btn-copy-share-url');
  const btnOpenShareUrl = document.getElementById('btn-open-share-url');
  const shareSensorStatus = document.getElementById('share-sensor-status');
  const shareSensorText = document.getElementById('share-sensor-text');

  let autoZoomEnabled = true;
  let isDrawingBlur = false;
  let blurStartX = 0;
  let blurStartY = 0;
  let currentRecord = null;
  let activeSteps = [];
  let activeBlurs = [];

  if (!recordId) {
    titleEl.textContent = 'ID rekaman tidak ditemukan di parameter URL.';
    return;
  }

  currentRecord = await loadRecordingFromDb(recordId);

  if (!currentRecord || !currentRecord.blob) {
    titleEl.textContent = 'Gagal memuat rekaman dari penyimpanan lokal browser.';
    errorBox.classList.remove('hidden');
    errorBox.textContent = 'Data video tidak ditemukan di penyimpanan lokal.';
    return;
  }

  titleEl.textContent = currentRecord.title || 'Panduan Layar Singkat';
  durationEl.textContent = `00:${String(currentRecord.duration).padStart(2, '0')}`;
  dateEl.textContent = currentRecord.date || 'Hari ini';

  const blob = currentRecord.blob;
  const videoBlobUrl = URL.createObjectURL(blob);
  videoEl.src = videoBlobUrl;
  videoEl.load();

  videoEl.onerror = () => {
    errorBox.classList.remove('hidden');
    errorBox.innerHTML = 'Format video webm sedang diproses. Gunakan tombol Unduh Video di atas.';
  };

  // Muat data langkah dan data sensor privasi
  activeSteps = processSmartGrouping(currentRecord.events || []);
  activeBlurs = (currentRecord.blurAreas || []).map(b => ({
    ...b,
    startSec: b.startSec !== undefined ? b.startSec : 0,
    endSec: b.endSec !== undefined ? b.endSec : (currentRecord.duration || 60)
  }));

  renderStepsUI();
  renderBlurBoxes();

  // Tombol Hapus Rekaman
  btnDeleteRecord.addEventListener('click', async () => {
    const confirmDelete = confirm('Apakah Anda yakin ingin menghapus rekaman ini dari komputer Anda?');
    if (!confirmDelete) return;

    await deleteRecordingFromDb(recordId);

    chrome.storage.local.get(['recordings'], (res) => {
      const list = (res.recordings || []).filter(item => item.id !== recordId);
      chrome.storage.local.set({ recordings: list }, () => {
        alert('Rekaman berhasil dihapus.');
        window.close();
      });
    });
  });

  // Toggle Auto-Zoom
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

  // -------------------------------------------------------------
  // FITUR SENSOR PRIVASI (DURASI & KOORDINAT)
  // -------------------------------------------------------------
  btnToggleBlur.addEventListener('click', () => {
    isDrawingBlur = !isDrawingBlur;
    if (isDrawingBlur) {
      btnToggleBlur.classList.add('active');
      blurToggleText.textContent = 'Tarik Kotak di Video...';
      blurDrawOverlay.classList.remove('hidden');
      videoEl.pause();
    } else {
      cancelBlurDrawing();
    }
  });

  blurDrawOverlay.addEventListener('mousedown', (e) => {
    const rect = blurDrawOverlay.getBoundingClientRect();
    blurStartX = e.clientX - rect.left;
    blurStartY = e.clientY - rect.top;

    blurSelectionBox.style.left = `${blurStartX}px`;
    blurSelectionBox.style.top = `${blurStartY}px`;
    blurSelectionBox.style.width = '0px';
    blurSelectionBox.style.height = '0px';
    blurSelectionBox.classList.remove('hidden');

    function onMouseMove(ev) {
      const curX = ev.clientX - rect.left;
      const curY = ev.clientY - rect.top;

      const left = Math.min(blurStartX, curX);
      const top = Math.min(blurStartY, curY);
      const width = Math.abs(curX - blurStartX);
      const height = Math.abs(curY - blurStartY);

      blurSelectionBox.style.left = `${left}px`;
      blurSelectionBox.style.top = `${top}px`;
      blurSelectionBox.style.width = `${width}px`;
      blurSelectionBox.style.height = `${height}px`;
    }

    function onMouseUp(ev) {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const curX = ev.clientX - rect.left;
      const curY = ev.clientY - rect.top;

      const left = Math.min(blurStartX, curX);
      const top = Math.min(blurStartY, curY);
      const width = Math.abs(curX - blurStartX);
      const height = Math.abs(curY - blurStartY);

      if (width > 15 && height > 15) {
        const totalW = blurDrawOverlay.clientWidth || 1;
        const totalH = blurDrawOverlay.clientHeight || 1;
        const curSec = Math.floor(videoEl.currentTime);
        const maxDur = Math.floor(currentRecord.duration || videoEl.duration || 60);

        // Standar durasi awal: mulai dari detik video saat ini, berakhir 5 detik kemudian atau di akhir video
        const newBlur = {
          id: 'blur_' + Date.now(),
          x: Math.round((left / totalW) * 1000) / 10,
          y: Math.round((top / totalH) * 1000) / 10,
          w: Math.round((width / totalW) * 1000) / 10,
          h: Math.round((height / totalH) * 1000) / 10,
          startSec: curSec,
          endSec: Math.min(maxDur, curSec + 5)
        };

        activeBlurs.push(newBlur);
        persistBlurUpdate();
        renderBlurBoxes();
      }

      cancelBlurDrawing();
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  function cancelBlurDrawing() {
    isDrawingBlur = false;
    btnToggleBlur.classList.remove('active');
    blurToggleText.textContent = '+ Sensor Privasi (Blur)';
    blurDrawOverlay.classList.add('hidden');
    blurSelectionBox.classList.add('hidden');
  }

  function renderBlurBoxes() {
    // 1. Render kotak visual di atas panggung video
    blurContainer.innerHTML = activeBlurs.map((b) => `
      <div class="blur-box" data-id="${b.id}" style="left:${b.x}%; top:${b.y}%; width:${b.w}%; height:${b.h}%;">
        <button class="btn-del-blur" data-del-blur="${b.id}" title="Hapus sensor ini">&times;</button>
      </div>
    `).join('');

    blurContainer.querySelectorAll('.btn-del-blur').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-del-blur');
        activeBlurs = activeBlurs.filter(b => b.id !== id);
        persistBlurUpdate();
        renderBlurBoxes();
      });
    });

    // 2. Render panel durasi sensor di bawah pemutar
    if (activeBlurs.length === 0) {
      blurListSection.classList.add('hidden');
      return;
    }

    blurListSection.classList.remove('hidden');
    blurCountBadge.textContent = `${activeBlurs.length} Area`;

    blurItemsList.innerHTML = activeBlurs.map((b, idx) => `
      <div class="blur-item-row" data-id="${b.id}">
        <div class="blur-item-left">
          <span class="blur-tag-badge">Area ${idx + 1}</span>
          <div class="blur-time-control">
            <span>Mulai:</span>
            <input type="number" min="0" class="blur-time-input input-start" value="${b.startSec}">
            <span>s</span>
            <button class="btn-set-curtime btn-set-start" title="Gunakan detik saat video diputar">Set Sekarang</button>
          </div>
          <div class="blur-time-control">
            <span>Selesai:</span>
            <input type="number" min="0" class="blur-time-input input-end" value="${b.endSec}">
            <span>s</span>
            <button class="btn-set-curtime btn-set-end" title="Gunakan detik saat video diputar">Set Sekarang</button>
          </div>
        </div>
        <div class="blur-item-right">
          <button class="btn-del-blur-item" data-del-blur="${b.id}" title="Hapus sensor ini">&times;</button>
        </div>
      </div>
    `).join('');

    // Listener input durasi manual
    blurItemsList.querySelectorAll('.blur-item-row').forEach(row => {
      const id = row.getAttribute('data-id');
      const item = activeBlurs.find(b => b.id === id);
      if (!item) return;

      const inputStart = row.querySelector('.input-start');
      const inputEnd = row.querySelector('.input-end');
      const btnSetStart = row.querySelector('.btn-set-start');
      const btnSetEnd = row.querySelector('.btn-set-end');
      const btnDel = row.querySelector('.btn-del-blur-item');

      inputStart.addEventListener('change', () => {
        item.startSec = Math.max(0, parseInt(inputStart.value, 10) || 0);
        persistBlurUpdate();
        syncBlurVisibility();
      });

      inputEnd.addEventListener('change', () => {
        item.endSec = Math.max(item.startSec, parseInt(inputEnd.value, 10) || 0);
        persistBlurUpdate();
        syncBlurVisibility();
      });

      btnSetStart.addEventListener('click', () => {
        const curSec = Math.floor(videoEl.currentTime);
        item.startSec = curSec;
        inputStart.value = curSec;
        if (item.endSec < curSec) {
          item.endSec = curSec + 3;
          inputEnd.value = item.endSec;
        }
        persistBlurUpdate();
        syncBlurVisibility();
      });

      btnSetEnd.addEventListener('click', () => {
        const curSec = Math.floor(videoEl.currentTime);
        item.endSec = Math.max(item.startSec, curSec);
        inputEnd.value = item.endSec;
        persistBlurUpdate();
        syncBlurVisibility();
      });

      btnDel.addEventListener('click', () => {
        activeBlurs = activeBlurs.filter(b => b.id !== id);
        persistBlurUpdate();
        renderBlurBoxes();
      });
    });

    syncBlurVisibility();
  }

  // Sinkronisasi visibilitas kotak blur berdasarkan durasi saat video berjalan
  function syncBlurVisibility() {
    const curTime = videoEl.currentTime;
    activeBlurs.forEach(b => {
      const el = blurContainer.querySelector(`[data-id="${b.id}"]`);
      if (el) {
        const isVisible = (curTime >= b.startSec && curTime <= (b.endSec + 0.3));
        el.style.display = isVisible ? 'block' : 'none';
      }
    });
  }

  function persistBlurUpdate() {
    if (!currentRecord) return;
    const req = indexedDB.open('BiteFlowStorage', 2);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');
      currentRecord.blurAreas = activeBlurs;
      store.put(currentRecord);
    };
  }

  // -------------------------------------------------------------
  // MANAJEMEN LANGKAH & AUTO-ZOOM
  // -------------------------------------------------------------
  btnAddStep.addEventListener('click', () => {
    const curSec = Math.floor(videoEl.currentTime);
    const userTitle = prompt('Tuliskan judul tindakan untuk langkah ini:', 'Langkah Baru');
    if (!userTitle) return;

    const userDetail = prompt('Tuliskan keterangan tambahan (opsional):', 'Perhatikan bagian ini.');

    const newStep = {
      timestamp: curSec,
      title: userTitle,
      detail: userDetail || '',
      relX: 0.5,
      relY: 0.5
    };

    activeSteps.push(newStep);
    renderStepsUI();
    persistStepsUpdate();
  });

  videoEl.addEventListener('timeupdate', () => {
    const curTime = videoEl.currentTime;
    const curSec = Math.floor(curTime);

    // 1. Perbarui visibilitas kotak blur berdasarkan durasi masing-masing
    syncBlurVisibility();

    // 2. Tandai kartu langkah aktif
    const cards = stepsListEl.querySelectorAll('.step-card');
    cards.forEach(card => {
      const time = parseInt(card.getAttribute('data-time'), 10) || 0;
      if (Math.abs(curSec - time) <= 1) {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }
    });

    // 3. Evaluasi efek auto-zoom
    if (!autoZoomEnabled || activeSteps.length === 0) {
      resetZoom();
      return;
    }

    const activeEvent = activeSteps.find(step => {
      return (curTime >= step.timestamp - 0.4) && (curTime <= step.timestamp + 1.2);
    });

    if (activeEvent) {
      applyZoom(activeEvent);
    } else {
      resetZoom();
    }
  });

  function applyZoom(ev) {
    const originX = ev.relX !== undefined ? (ev.relX * 100) : 50;
    const originY = ev.relY !== undefined ? (ev.relY * 100) : 50;

    videoStage.style.transformOrigin = `${originX}% ${originY}%`;
    videoStage.classList.add('zoomed');

    clickMarker.style.left = `${originX}%`;
    clickMarker.style.top = `${originY}%`;
    clickMarker.classList.remove('hidden');
  }

  function resetZoom() {
    videoStage.classList.remove('zoomed');
    videoStage.style.transformOrigin = 'center center';
    clickMarker.classList.add('hidden');
  }

  function formatHumanFriendlyTag(tagName, label) {
    const tag = (tagName || '').toLowerCase();
    if (tag === 'button') return `Klik tombol "${label}"`;
    if (tag === 'a') return `Klik tautan "${label}"`;
    if (tag === 'input' || tag === 'textarea') return `Isi kolom "${label || 'teks'}"`;
    if (tag === 'select') return `Pilih opsi "${label}"`;
    return label ? `Pilih "${label}"` : 'Tindakan pada layar';
  }

  function processSmartGrouping(rawEvents) {
    if (!rawEvents || rawEvents.length === 0) {
      return [{
        timestamp: 0,
        title: 'Mulai Alur Panduan',
        detail: 'Perhatikan demonstrasi pada pemutar video.',
        relX: 0.5,
        relY: 0.5
      }];
    }

    const grouped = [];
    const isForm = (t) => ['input', 'select', 'textarea'].includes((t || '').toLowerCase());

    rawEvents.forEach((ev) => {
      const last = grouped[grouped.length - 1];

      if (last && isForm(last.rawTag) && isForm(ev.tagName) && (ev.timestamp - last.timestamp <= 3)) {
        last.title = 'Lengkapi Formulir Isian';
        last.detail = 'Masukkan data pada kolom-kolom yang tersedia.';
        return;
      }

      if (last && (ev.timestamp - last.timestamp < 2)) {
        return;
      }

      const friendlyTitle = formatHumanFriendlyTag(ev.tagName, ev.label);

      grouped.push({
        timestamp: ev.timestamp,
        title: friendlyTitle,
        detail: 'Lakukan tindakan ini pada tampilan layar.',
        relX: ev.relX !== undefined ? ev.relX : 0.5,
        relY: ev.relY !== undefined ? ev.relY : 0.5,
        rawTag: ev.tagName
      });
    });

    return grouped;
  }

  function renderStepsUI() {
    if (activeSteps.length === 0) {
      stepsListEl.innerHTML = '<div class="steps-hint">Tidak ada langkah kerja. Klik "+ Tambah Langkah" untuk menyisipkan.</div>';
      return;
    }

    stepsListEl.innerHTML = activeSteps.map((step, idx) => `
      <div class="step-card ${idx === 0 ? 'active' : ''}" data-index="${idx}" data-time="${step.timestamp}">
        <div class="step-top">
          <span class="step-num">
            <span class="step-num-circle">${idx + 1}</span>
            Langkah ${idx + 1}
          </span>
          <div class="step-top-right">
            <span class="step-time">00:${String(step.timestamp).padStart(2, '0')}</span>
            <div class="btn-reorder-group">
              <button class="btn-reorder btn-move-up" data-index="${idx}" title="Geser ke atas" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
              <button class="btn-reorder btn-move-down" data-index="${idx}" title="Geser ke bawah" ${idx === activeSteps.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
            </div>
            <button class="btn-step-delete" data-del-index="${idx}" title="Hapus langkah ini">&times;</button>
          </div>
        </div>
        <div class="step-title-input" contenteditable="true" spellcheck="false" data-field="title">${escapeHtml(step.title)}</div>
        <div class="step-detail-input" contenteditable="true" spellcheck="false" data-field="detail">${escapeHtml(step.detail)}</div>
      </div>
    `).join('');

    stepsListEl.querySelectorAll('.step-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-step-delete') || e.target.closest('.btn-reorder') || e.target.getAttribute('contenteditable') === 'true') {
          return;
        }

        const time = parseInt(card.getAttribute('data-time'), 10) || 0;
        videoEl.currentTime = time;
        videoEl.play();

        stepsListEl.querySelectorAll('.step-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });

    stepsListEl.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (index > 0) {
          const temp = activeSteps[index];
          activeSteps[index] = activeSteps[index - 1];
          activeSteps[index - 1] = temp;
          renderStepsUI();
          persistStepsUpdate();
        }
      });
    });

    stepsListEl.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (index < activeSteps.length - 1) {
          const temp = activeSteps[index];
          activeSteps[index] = activeSteps[index + 1];
          activeSteps[index + 1] = temp;
          renderStepsUI();
          persistStepsUpdate();
        }
      });
    });

    stepsListEl.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.addEventListener('blur', () => {
        const card = el.closest('.step-card');
        const index = parseInt(card.getAttribute('data-index'), 10);
        const field = el.getAttribute('data-field');

        if (activeSteps[index]) {
          activeSteps[index][field] = el.innerText.trim();
          persistStepsUpdate();
        }
      });
    });

    stepsListEl.querySelectorAll('.btn-step-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const delIndex = parseInt(btn.getAttribute('data-del-index'), 10);
        activeSteps.splice(delIndex, 1);
        renderStepsUI();
        persistStepsUpdate();
      });
    });
  }

  function persistStepsUpdate() {
    if (!currentRecord) return;
    const req = indexedDB.open('BiteFlowStorage', 2);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');
      currentRecord.events = activeSteps;
      store.put(currentRecord);
    };
  }

  btnDownloadVideo.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = videoBlobUrl;
    a.download = `BiteFlow-${(currentRecord.title || 'Panduan').replace(/\s+/g, '_')}.webm`;
    a.click();
  });

  btnDownloadHtml.addEventListener('click', () => {
    exportSingleHtml(currentRecord);
  });

  // Modal Berbagi Tautan (7 Hari) & Bakar Sensor Permanen
  btnShareLink.addEventListener('click', () => {
    shareModal.classList.remove('hidden');

    const hasBlurs = activeBlurs.length > 0;
    if (hasBlurs && !currentRecord.isBurnedIn) {
      burninNotice.classList.remove('hidden');
      btnBakeSensor.classList.remove('hidden');
      shareSensorStatus.classList.add('hidden');
    } else if (currentRecord.isBurnedIn) {
      burninNotice.classList.add('hidden');
      btnBakeSensor.classList.add('hidden');
      shareSensorStatus.classList.remove('hidden');
    } else {
      burninNotice.classList.add('hidden');
      btnBakeSensor.classList.add('hidden');
      shareSensorStatus.classList.add('hidden');
    }

    // Tautan publik dengan retensi 7-hari
    const publicUrl = `https://biteflow.pages.dev/v/?v=${recordId}`;
    shareUrlInput.value = publicUrl;
    btnOpenShareUrl.disabled = false;
  });

  btnCloseModal.addEventListener('click', () => {
    shareModal.classList.add('hidden');
  });

  // Salin Tautan
  btnCopyShareUrl.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrlInput.value);
      const prevText = btnCopyShareUrl.textContent;
      btnCopyShareUrl.textContent = 'Tersalin!';
      setTimeout(() => {
        btnCopyShareUrl.textContent = prevText;
      }, 2000);
    } catch (e) {
      shareUrlInput.select();
      document.execCommand('copy');
      alert('Tautan berhasil disalin ke clipboard.');
    }
  });

  // Buka Pemutar Web di Tab Baru (Membuka Web Viewer lokal langsung untuk verifikasi)
  btnOpenShareUrl.addEventListener('click', () => {
    const viewerUrl = chrome.runtime.getURL('web/v/index.html') + `?v=${recordId}`;
    window.open(viewerUrl, '_blank');
  });

  // Bakar Sensor Permanen ke Piksel Video (Canvas Frame Processor)
  btnBakeSensor.addEventListener('click', async () => {
    if (!currentRecord || !currentRecord.blob) return;

    btnBakeSensor.disabled = true;
    burninNotice.classList.add('hidden');
    burninProgressWrap.classList.remove('hidden');
    burninProgressFill.style.width = '0%';
    burninProgressPct.textContent = '0%';

    try {
      const bakedBlob = await burnInVideoPixels(
        currentRecord.blob,
        activeBlurs,
        currentRecord.duration || 60,
        (pct) => {
          const val = Math.min(100, Math.round(pct * 100));
          burninProgressFill.style.width = `${val}%`;
          burninProgressPct.textContent = `${val}%`;
        }
      );

      currentRecord.blob = bakedBlob;
      currentRecord.isBurnedIn = true;
      currentRecord.blurAreas = activeBlurs;
      await saveRecordingToDb(currentRecord);

      const newUrl = URL.createObjectURL(bakedBlob);
      videoEl.src = newUrl;
      videoEl.load();

      burninProgressWrap.classList.add('hidden');
      btnBakeSensor.classList.add('hidden');
      shareSensorStatus.classList.remove('hidden');
      shareSensorText.textContent = 'Sensor privasi permanen: Piksel sensitif telah dihapus dari berkas video.';
      alert('Sensor privasi berhasil dibakar permanen ke dalam video. Informasi rahasia kini aman dari inspect element browser.');
    } catch (err) {
      console.error('Bake error:', err);
      alert('Gagal membakar sensor: ' + (err.message || 'Error tidak diketahui'));
      burninProgressWrap.classList.add('hidden');
      btnBakeSensor.disabled = false;
      burninNotice.classList.remove('hidden');
    }
  });

  // Pemroses Video Kanvas: Membakar Sensor Privasi Langsung ke Aliran Piksel (Unrecoverable)
  function burnInVideoPixels(sourceBlob, blurs, duration, onProgress) {
    return new Promise((resolve, reject) => {
      const hiddenVideo = document.createElement('video');
      hiddenVideo.src = URL.createObjectURL(sourceBlob);
      hiddenVideo.muted = true;
      hiddenVideo.playsInline = true;

      hiddenVideo.onloadedmetadata = () => {
        const width = hiddenVideo.videoWidth || 1280;
        const height = hiddenVideo.videoHeight || 720;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const stream = canvas.captureStream(30);
        let mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const finalBlob = new Blob(chunks, { type: 'video/webm' });
          resolve(finalBlob);
        };

        let animFrameId = null;

        function processFrame() {
          if (hiddenVideo.paused || hiddenVideo.ended) return;

          ctx.drawImage(hiddenVideo, 0, 0, width, height);

          const curTime = hiddenVideo.currentTime;

          blurs.forEach(b => {
            if (curTime >= b.startSec && curTime <= (b.endSec + 0.3)) {
              const bx = (b.x / 100) * width;
              const by = (b.y / 100) * height;
              const bw = (b.w / 100) * width;
              const bh = (b.h / 100) * height;

              // Kotak penutup solid gelap merusak piksel di bawahnya
              ctx.fillStyle = '#18181b';
              ctx.fillRect(bx, by, bw, bh);

              // Watermark sensor
              ctx.fillStyle = '#a1a1aa';
              ctx.font = 'bold 12px monospace';
              ctx.fillText('[SENSOR PRIVASI]', bx + 8, by + 18);
            }
          });

          onProgress(curTime / (duration || hiddenVideo.duration || 1));
          animFrameId = requestAnimationFrame(processFrame);
        }

        recorder.start(100);

        hiddenVideo.play().then(() => {
          animFrameId = requestAnimationFrame(processFrame);
        }).catch(reject);

        hiddenVideo.onended = () => {
          cancelAnimationFrame(animFrameId);
          onProgress(1);
          setTimeout(() => {
            recorder.stop();
          }, 300);
        };

        hiddenVideo.onerror = (e) => {
          cancelAnimationFrame(animFrameId);
          recorder.stop();
          reject(new Error('Gagal memproses video'));
        };
      };

      hiddenVideo.onerror = () => reject(new Error('Gagal membaca berkas video'));
    });
  }

  function exportSingleHtml(record) {
    const reader = new FileReader();
    reader.readAsDataURL(record.blob);
    reader.onloadend = () => {
      const base64Video = reader.result;

      const blurBoxesHtml = activeBlurs.map((b, i) => `
        <div id="export-blur-${i}" data-start="${b.startSec}" data-end="${b.endSec}" style="position:absolute; left:${b.x}%; top:${b.y}%; width:${b.w}%; height:${b.h}%; backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); background-color:rgba(24,24,27,0.35); border-radius:6px; pointer-events:none; display:none;"></div>
      `).join('');

      const stepsHtml = activeSteps.map((step, idx) => `
        <div style="background:#ffffff; border:1px solid #e4e4e7; border-radius:10px; padding:12px 16px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong style="font-size:12px; color:#18181b;">Langkah ${idx + 1}</strong>
            <span style="font-family:monospace; font-size:11px; background:#f4f4f5; padding:2px 6px; border-radius:4px;">00:${String(step.timestamp).padStart(2, '0')}</span>
          </div>
          <div style="font-size:13px; font-weight:600; color:#18181b; margin-bottom:2px;">${escapeHtml(step.title)}</div>
          <div style="font-size:11px; color:#71717a;">${escapeHtml(step.detail)}</div>
        </div>
      `).join('');

      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(record.title || 'Panduan BiteFlow')}</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #fafafa; color: #18181b; padding: 32px 20px; max-width: 900px; margin: 0 auto; line-height: 1.5; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    p { font-size: 12px; color: #71717a; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
    @media (min-width: 800px) { .grid { grid-template-columns: 3fr 2fr; } }
    .video-wrap { position: relative; border-radius: 12px; overflow: hidden; background: #000; border: 1px solid #27272a; }
    video { width: 100%; display: block; }
  </style>
</head>
<body>
  <h1>${escapeHtml(record.title || 'Panduan Layar Singkat')}</h1>
  <p>Durasi: 00:${String(record.duration).padStart(2, '0')} • Dibuat secara mandiri dengan BiteFlow</p>
  <div class="grid">
    <div class="video-wrap">
      <video id="exp-video" src="${base64Video}" controls autoplay playsinline></video>
      ${blurBoxesHtml}
    </div>
    <div>
      <h3 style="font-size:11px; font-weight:700; color:#71717a; letter-spacing:0.5px; margin-bottom:12px;">DAFTAR LANGKAH KERJA</h3>
      ${stepsHtml}
    </div>
  </div>
  <script>
    const expVid = document.getElementById('exp-video');
    const blurEls = document.querySelectorAll('[id^="export-blur-"]');
    if (expVid && blurEls.length > 0) {
      expVid.addEventListener('timeupdate', () => {
        const cur = expVid.currentTime;
        blurEls.forEach(el => {
          const s = parseFloat(el.getAttribute('data-start')) || 0;
          const e = parseFloat(el.getAttribute('data-end')) || 9999;
          el.style.display = (cur >= s && cur <= (e + 0.3)) ? 'block' : 'none';
        });
      });
    }
  </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `BiteFlow-${(record.title || 'Panduan').replace(/\s+/g, '_')}.html`;
      a.click();
    };
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

function loadRecordingFromDb(id) {
  return new Promise((resolve) => {
    const req = indexedDB.open('BiteFlowStorage', 2);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings', { keyPath: 'id' });
      }
    };

    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('recordings', 'readonly');
      const store = tx.objectStore('recordings');
      const getReq = store.get(id);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => resolve(null);
    };

    req.onerror = () => resolve(null);
  });
}

function deleteRecordingFromDb(id) {
  return new Promise((resolve) => {
    const req = indexedDB.open('BiteFlowStorage', 2);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');
      store.delete(id);
      tx.oncomplete = () => resolve();
    };
    req.onerror = () => resolve();
  });
}

function saveRecordingToDb(record) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('BiteFlowStorage', 2);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}
