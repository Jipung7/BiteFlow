// Script sederhana untuk menghasilkan ikon PNG valid untuk ekstensi
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(size, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); // width
  ihdr.writeUInt32BE(size, 4); // height
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with scanlines
  // Each scanline: 1 byte filter type (0) + width * 4 bytes (RGBA)
  const scanlineWidth = 1 + size * 4;
  const rawData = Buffer.alloc(scanlineWidth * size);

  for (let y = 0; y < size; y++) {
    const rowOffset = y * scanlineWidth;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // Draw a sleek dark rounded square with a small red dot in the center
      const dx = x - size / 2;
      const dy = y - size / 2;
      const distCenter = Math.sqrt(dx * dx + dy * dy);

      if (distCenter < size * 0.2) {
        // Red recording dot in center
        rawData[pixelOffset] = 239;     // R
        rawData[pixelOffset + 1] = 68;  // G
        rawData[pixelOffset + 2] = 68;  // B
        rawData[pixelOffset + 3] = 255; // A
      } else {
        // Dark sleek background
        rawData[pixelOffset] = 24;      // R
        rawData[pixelOffset + 1] = 24;  // G
        rawData[pixelOffset + 2] = 27;  // B
        rawData[pixelOffset + 3] = 255; // A
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.slice(4, 8 + len));
  buf.writeInt32BE(crc, 8 + len);
  return buf;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1);
}

const iconsDir = path.join(__dirname, '..', 'extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  const png = createPng(size, 24, 24, 27);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`Generated icon${size}.png`);
});
