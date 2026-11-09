// BiteFlow Offscreen: MediaRecorder & IndexedDB Writer
// Berkas ini hanya menggunakan API DOM & IndexedDB standar tanpa menyentuh chrome.storage

let mediaRecorder = null;
let recordedChunks = [];
let mediaStream = null;
let startTime = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  if (message.action === 'START_CAPTURE') {
    startCapture(message.streamId)
      .then(() => sendResponse({ status: 'started' }))
      .catch((err) => sendResponse({ status: 'error', error: err.message }));
    return true;
  } else if (message.action === 'STOP_CAPTURE') {
    stopCapture(message.recordId, message.events || [], message.title || 'Panduan Layar');
    sendResponse({ status: 'stopping' });
    return true;
  }
});

async function startCapture(streamId) {
  recordedChunks = [];
  startTime = Date.now();

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    }
  };

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    throw new Error('Gagal mengakses stream tab: ' + err.message);
  }

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    ? 'video/webm;codecs=vp8,opus'
    : MediaRecorder.isTypeSupported('video/webm')
    ? 'video/webm'
    : '';

  mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : {});

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.start(250);
}

function stopCapture(recordId, events, title) {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    return;
  }

  mediaRecorder.onstop = async () => {
    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });

      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }

      await saveToIndexedDB(recordId, videoBlob, events, durationSeconds, title);

      // Beritahu background bahwa penyimpanan IndexedDB telah selesai 100%
      chrome.runtime.sendMessage({
        action: 'MEDIA_SAVED',
        recordId: recordId,
        title: title,
        duration: durationSeconds
      });
    } catch (err) {
      console.error('Gagal memproses rekaman di offscreen:', err);
    }
  };

  mediaRecorder.stop();
}

function saveToIndexedDB(id, blob, events, duration, title) {
  return new Promise((resolve, reject) => {
    // Gunakan nama database BiteFlowStorage v2 untuk memastikan skema bersih dan terisolasi
    const req = indexedDB.open('BiteFlowStorage', 2);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings', { keyPath: 'id' });
      }
    };

    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');

      const recordItem = {
        id: id,
        blob: blob,
        events: events,
        duration: duration,
        title: title,
        date: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      store.put(recordItem);

      tx.oncomplete = () => {
        resolve();
      };

      tx.onerror = () => reject(tx.error);
    };

    req.onerror = () => reject(req.error);
  });
}
