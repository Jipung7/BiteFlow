(function () {
  if (window.__biteflow_loaded) {
    if (typeof window.__biteflow_init === 'function') {
      window.__biteflow_init();
    }
    return;
  }
  window.__biteflow_loaded = true;

  let timerInterval = null;
  let recordingStartTime = 0;

  window.__biteflow_init = initRecordingState;

  initRecordingState();

  // Dengarkan perubahan status rekaman dari storage lokal agar HUD sinkron seketika
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.isRecording) {
      if (changes.isRecording.newValue) {
        chrome.storage.local.get(['recordingStartTime'], (res) => {
          recordingStartTime = res.recordingStartTime || Date.now();
          showFloatingHud();
          startClickTracker();
        });
      } else {
        removeFloatingHud();
        stopClickTracker();
      }
    }
  });

  function initRecordingState() {
    chrome.storage.local.get(['isRecording', 'recordingStartTime'], (res) => {
      if (res.isRecording) {
        recordingStartTime = res.recordingStartTime || Date.now();
        showFloatingHud();
        startClickTracker();
      } else {
        removeFloatingHud();
        stopClickTracker();
      }
    });
  }

  function startClickTracker() {
    window.removeEventListener('click', handleClickCapture, true);
    window.addEventListener('click', handleClickCapture, true);
  }

  function stopClickTracker() {
    window.removeEventListener('click', handleClickCapture, true);
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function handleClickCapture(e) {
    if (e.target.closest('#biteflow-floating-hud')) return;

    const target = e.target;
    let label = target.innerText || target.placeholder || target.getAttribute('aria-label') || target.value || target.tagName;
    label = (label || '').trim().substring(0, 40);

    const curSec = Math.max(0, Math.floor((Date.now() - recordingStartTime) / 1000));

    // Koordinat relatif dinormalisasi (0 - 1) agar titik fokus zoom tetap akurat meski ukuran player video berbeda
    const relX = Math.round((e.clientX / window.innerWidth) * 1000) / 1000;
    const relY = Math.round((e.clientY / window.innerHeight) * 1000) / 1000;

    const clickData = {
      timestamp: curSec,
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
      relX: relX,
      relY: relY,
      tagName: target.tagName.toLowerCase(),
      label: label || 'Elemen Web',
      pageUrl: window.location.href
    };

    chrome.storage.local.get(['tempEvents'], (res) => {
      const events = res.tempEvents || [];
      events.push(clickData);
      chrome.storage.local.set({ tempEvents: events });
    });

    showClickRipple(e.clientX, e.clientY);
  }

  function showClickRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'biteflow-click-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 400);
  }

  function showFloatingHud() {
    removeFloatingHud();

    const hud = document.createElement('div');
    hud.id = 'biteflow-floating-hud';
    hud.innerHTML = `
      <div class="biteflow-status">
        <span class="biteflow-rec-dot"></span>
        <span class="biteflow-timer" id="biteflow-timer-text">00:00</span>
        <span class="biteflow-limit">/ 01:00</span>
      </div>
      <div class="biteflow-divider"></div>
      <div class="biteflow-actions">
        <button class="biteflow-btn-finish" id="biteflow-btn-finish">Selesai</button>
      </div>
    `;

    document.body.appendChild(hud);

    updateTimerDisplay();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimerDisplay, 1000);

    document.getElementById('biteflow-btn-finish').addEventListener('click', () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      removeFloatingHud();
      chrome.runtime.sendMessage({ action: 'STOP_RECORDING' });
    });
  }

  function updateTimerDisplay() {
    const timerText = document.getElementById('biteflow-timer-text');
    if (!timerText) return;

    const sec = Math.max(0, Math.floor((Date.now() - recordingStartTime) / 1000));
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    timerText.textContent = `${mins}:${secs}`;

    // Hentikan timer dan kirim sinyal berhenti tepat satu kali saat mencapai 60 detik
    if (sec >= 60) {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      removeFloatingHud();
      chrome.runtime.sendMessage({ action: 'STOP_RECORDING' });
    }
  }

  function removeFloatingHud() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const hud = document.getElementById('biteflow-floating-hud');
    if (hud) hud.remove();
  }
})();
