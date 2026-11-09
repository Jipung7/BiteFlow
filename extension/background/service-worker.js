// BiteFlow Background Service Worker

let offscreenCreated = false;
let isStopping = false;

async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) {
    offscreenCreated = true;
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen/offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Merekam aliran tab browser secara persisten di latar belakang'
  });

  offscreenCreated = true;
}

async function closeOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) {
    await chrome.offscreen.closeDocument();
  }
  offscreenCreated = false;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'START_RECORDING') {
    isStopping = false;
    handleStartRecording(message.options)
      .then(() => sendResponse({ status: 'ok' }))
      .catch((err) => sendResponse({ status: 'error', message: err.message }));
    return true;
  } else if (message.action === 'STOP_RECORDING') {
    handleStopRecording()
      .then(() => sendResponse({ status: 'ok' }))
      .catch((err) => sendResponse({ status: 'error', message: err.message }));
    return true;
  } else if (message.action === 'MEDIA_SAVED') {
    // Sinyal resmi dari offscreen bahwa video dan events telah tersimpan 100% di IndexedDB
    handleMediaSaved(message);
    return true;
  }
});

async function handleStartRecording(options = {}) {
  await ensureOffscreenDocument();

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab || !activeTab.id) {
    throw new Error('Tidak ada tab aktif yang dapat direkam.');
  }

  const streamId = await chrome.tabCapture.getMediaStreamId({
    targetTabId: activeTab.id
  });

  await chrome.storage.local.set({
    isRecording: true,
    tempEvents: [],
    activeTabTitle: activeTab.title || 'Panduan Layar',
    recordingStartTime: Date.now()
  });

  const res = await chrome.runtime.sendMessage({
    target: 'offscreen',
    action: 'START_CAPTURE',
    streamId: streamId,
    options: options
  });

  if (res && res.status === 'error') {
    await chrome.storage.local.set({ isRecording: false });
    throw new Error(res.error);
  }

  // Suntikkan style dan content script langsung ke tab aktif
  try {
    await chrome.scripting.insertCSS({
      target: { tabId: activeTab.id },
      files: ['content/content.css']
    });
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['content/content.js']
    });
  } catch (e) {}
}

async function handleStopRecording() {
  if (isStopping) return;

  const state = await chrome.storage.local.get(['isRecording', 'tempEvents', 'activeTabTitle']);
  if (!state.isRecording) return;

  isStopping = true;
  await chrome.storage.local.set({ isRecording: false });

  const recordId = 'rec_' + Date.now();

  // Kirim data events dan judul langsung ke offscreen tanpa membiarkan offscreen memanggil chrome.storage
  chrome.runtime.sendMessage({
    target: 'offscreen',
    action: 'STOP_CAPTURE',
    recordId: recordId,
    events: state.tempEvents || [],
    title: state.activeTabTitle || 'Panduan Layar'
  });
}

async function handleMediaSaved(data) {
  const recordId = data.recordId;
  const previewUrl = chrome.runtime.getURL(`preview/preview.html?id=${recordId}`);

  // Simpan riwayat di storage lokal untuk popup
  const store = await chrome.storage.local.get(['recordings']);
  const list = store.recordings || [];
  list.unshift({
    id: recordId,
    title: data.title || 'Panduan Layar',
    duration: `00:${String(data.duration).padStart(2, '0')}`,
    date: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    url: previewUrl
  });
  await chrome.storage.local.set({ recordings: list });

  // Buka tab preview setelah berkas dipastikan tersimpan
  chrome.tabs.create({ url: previewUrl });

  closeOffscreenDocument();
  isStopping = false;
}
