// Removes metadata (EXIF with GPS location, camera details, comments, text) from uploaded
// JPEG/PNG images without touching the pixels. A phone photo of a signature otherwise
// carries where and when it was taken. Anything that does not parse is returned unchanged.

// JPEG: APP1 (EXIF/XMP), APP13 (IPTC) and COM segments go; JFIF, ICC colour and Adobe stay.
const DROP_JPEG = new Set([0xe1, 0xed, 0xfe]);
// PNG: text, EXIF and timestamp chunks go; image, palette and colour chunks stay.
const DROP_PNG = new Set(['eXIf', 'tEXt', 'iTXt', 'zTXt', 'tIME']);

function stripJpeg(buffer) {
  const parts = [buffer.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= buffer.length) {
    if (buffer[i] !== 0xff) return buffer;
    const marker = buffer[i + 1];
    if (marker === 0xff) { i += 1; continue; } // fill byte
    if (marker === 0xda) { parts.push(buffer.subarray(i)); return Buffer.concat(parts); } // image data
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { parts.push(buffer.subarray(i, i + 2)); i += 2; continue; }
    const end = i + 2 + buffer.readUInt16BE(i + 2);
    if (end > buffer.length) return buffer;
    if (!DROP_JPEG.has(marker)) parts.push(buffer.subarray(i, end));
    i = end;
  }
  return buffer;
}

function stripPng(buffer) {
  const parts = [buffer.subarray(0, 8)];
  let i = 8;
  while (i + 12 <= buffer.length) {
    const end = i + 12 + buffer.readUInt32BE(i);
    if (end > buffer.length) return buffer;
    const type = buffer.toString('latin1', i + 4, i + 8);
    if (!DROP_PNG.has(type)) parts.push(buffer.subarray(i, end));
    i = end;
    if (type === 'IEND') return Buffer.concat(parts);
  }
  return buffer;
}

function stripImageMetadata(buffer, ext) {
  try {
    return ext === '.png' ? stripPng(buffer) : stripJpeg(buffer);
  } catch {
    return buffer;
  }
}

module.exports = { stripImageMetadata };
