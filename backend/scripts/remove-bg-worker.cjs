/**
 * Worker tách nền — chạy trong PROCESS RIÊNG.
 * Lý do: @imgly/background-removal-node nhúng sharp 0.32.6 (libvips riêng), xung
 * đột native DLL với sharp 0.34 của app nếu nạp chung process. Tách process để
 * mỗi bên dùng libvips của mình, không đụng nhau.
 *
 * Dùng: node remove-bg-worker.cjs <inputPath> <outputPath>
 */
const fs = require('fs');
const path = require('path');
const { removeBackground } = require('@imgly/background-removal-node');

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

(async () => {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error('usage: remove-bg-worker.cjs <input> <output>');
    process.exit(2);
  }
  const type = MIME[path.extname(inputPath).toLowerCase()] || 'image/png';
  const buffer = fs.readFileSync(inputPath);
  // imgly nhận diện format qua blob.type -> bắt buộc bọc Blob có type.
  const blob = new Blob([buffer], { type });
  const result = await removeBackground(blob, { model: 'medium' });
  const out = Buffer.from(await result.arrayBuffer());
  fs.writeFileSync(outputPath, out);
})().catch((err) => {
  console.error(err && err.message ? err.message : String(err));
  process.exit(1);
});
