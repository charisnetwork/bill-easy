const test = require('node:test');
const assert = require('node:assert/strict');
const { stripImageMetadata } = require('../utils/stripImageMetadata');

const segment = (marker, payload) => {
  const head = Buffer.alloc(4);
  head[0] = 0xff; head[1] = marker; head.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([head, payload]);
};
const chunk = (type, data) => {
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  return Buffer.concat([length, Buffer.from(type, 'latin1'), data, Buffer.alloc(4)]);
};

test('JPEG loses EXIF (GPS) and comments but keeps JFIF, colour profile and image data', () => {
  const jfif = segment(0xe0, Buffer.from('JFIF\0'));
  const exif = segment(0xe1, Buffer.from('Exif\0\0GPS 12.97N 77.59E'));
  const icc = segment(0xe2, Buffer.from('ICC_PROFILE\0'));
  const comment = segment(0xfe, Buffer.from('taken at home'));
  const scan = Buffer.from([0xff, 0xda, 0x00, 0x02, 1, 2, 3, 0xff, 0xd9]);
  const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8]), jfif, exif, icc, comment, scan]);
  const clean = stripImageMetadata(jpeg, '.jpg');
  assert.deepEqual(clean, Buffer.concat([Buffer.from([0xff, 0xd8]), jfif, icc, scan]));
  assert.ok(!clean.includes('GPS'));
});

test('PNG loses text and EXIF chunks but keeps image chunks', () => {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = chunk('IHDR', Buffer.alloc(13)); const idat = chunk('IDAT', Buffer.from([1, 2, 3])); const iend = chunk('IEND', Buffer.alloc(0));
  const png = Buffer.concat([sig, ihdr, chunk('tEXt', Buffer.from('Author\0Someone')), chunk('eXIf', Buffer.from('GPS')), idat, iend]);
  assert.deepEqual(stripImageMetadata(png, '.png'), Buffer.concat([sig, ihdr, idat, iend]));
});

test('a file that does not parse is left unchanged', () => {
  const odd = Buffer.from([0xff, 0xd8, 0x00, 0x11]);
  assert.equal(stripImageMetadata(odd, '.jpg'), odd);
});
