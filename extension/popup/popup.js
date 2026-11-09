// BiteFlow Extension Popup Logic
document.addEventListener('DOMContentLoaded', async () => {
  const btnStart = document.getElementById('btn-start');
  const btnText = document.getElementById('btn-text');
  const toggleAudio = document.getElementById('toggle-audio');
  const toggleHighlight = document.getElementById('toggle-highlight');
  const historyList = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');

  const savedSettings = await chrome.storage.local.get(['audioEnabled', 'highlightEnabled', 'isRecording', 'recordings']);
  if (savedSettings.audioEnabled !== undefined) toggleAudio.checked = savedSettings.audioEnabled;
  if (savedSettings.highlightEnabled !== undefined) toggleHighlight.checked = savedSettings.highlightEnabled;

  if (savedSettings.isRecording) {
    btnStart.classList.add('recording');
    btnText.textContent = 'Hentikan Rekaman';
  }

  renderHistory(savedSettings.recordings || []);

  toggleAudio.addEventListener('change', () => {
    chrome.storage.local.set({ audioEnabled: toggleAudio.checked });
  });

  toggleHighlight.addEventListener('change', () => {
    chrome.storage.local.set({ highlightEnabled: toggleHighlight.checked });
  });

  // Hapus semua riwayat
  btnClearHistory.addEventListener('click', async () => {
    if (!confirm('Hapus seluruh riwayat rekaman dari daftar?')) return;
    await chrome.storage.local.set({ recordings: [] });
    renderHistory([]);
  });

  btnStart.addEventListener('click', async () => {
    const state = await chrome.storage.local.get(['isRecording']);

    if (state.isRecording) {
      btnText.textContent = 'Menyimpan...';
      chrome.runtime.sendMessage({ action: 'STOP_RECORDING' });
      window.close();
    } else {
      btnText.textContent = 'Menyiapkan...';
      try {
        const res = await chrome.runtime.sendMessage({
          action: 'START_RECORDING',
          options: {
            audio: toggleAudio.checked,
            highlight: toggleHighlight.checked
          }
        });

        if (res && res.status === 'error') {
          alert('Gagal memulai rekaman: ' + res.message);
          btnText.textContent = 'Mulai Rekam Layar';
          return;
        }

        window.close();
      } catch (err) {
        alert('Gagal memulai rekaman. Silakan coba kembali.');
        btnText.textContent = 'Mulai Rekam Layar';
      }
    }
  });

  function renderHistory(items) {
    if (!items || items.length === 0) {
      historyList.innerHTML = '<div class="empty-state">Belum ada rekaman tersimpan.</div>';
      return;
    }

    historyList.innerHTML = items.slice(0, 5).map((item) => `
      <div class="history-item">
        <div class="history-meta">
          <div class="history-title">${item.title || 'Panduan Layar'}</div>
          <div class="history-sub">${item.duration || '00:30'} • ${item.date || 'Hari ini'}</div>
        </div>
        <div class="history-actions">
          <button class="btn-copy" data-url="${item.url || '#'}">Buka</button>
          <button class="btn-del-item" data-id="${item.id}" title="Hapus rekaman ini">&times;</button>
        </div>
      </div>
    `).join('');

    historyList.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const url = e.target.getAttribute('data-url');
        if (url && url !== '#') chrome.tabs.create({ url });
      });
    });

    historyList.querySelectorAll('.btn-del-item').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const store = await chrome.storage.local.get(['recordings']);
        const updated = (store.recordings || []).filter(item => item.id !== id);
        await chrome.storage.local.set({ recordings: updated });
        renderHistory(updated);
      });
    });
  }
});
