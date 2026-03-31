const sharp = require('sharp');
const WebP = require('node-webpmux');
const path = require('path');
const fs = require('fs/promises');

const SIZE = parseInt(process.env.SIZE || '450');
const CELL = SIZE / 3;
const TOTAL_FRAMES = 512;
const FRAME_DELAY = 100; // ms
const FONT_SIZE = Math.round(SIZE * 0.16);

const CENTERS = [];
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    CENTERS.push({ x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 });
  }
}

function generateSvgFrame(value) {
  const bin = value.toString(2);
  const digits = CENTERS.map((pos, i) => {
    if (i >= bin.length) return '';
    return `<text x="${pos.x}" y="${pos.y}" class="d">${bin[i]}</text>`;
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <style>.d{font-family:'Courier New',monospace;font-size:${FONT_SIZE}px;font-weight:bold;text-anchor:middle;dominant-baseline:central;fill:black}</style>
  <rect width="${SIZE}" height="${SIZE}" fill="white"/>
  <line x1="${CELL}" y1="0" x2="${CELL}" y2="${SIZE}" stroke="#ccc" stroke-width="2"/>
  <line x1="${CELL * 2}" y1="0" x2="${CELL * 2}" y2="${SIZE}" stroke="#ccc" stroke-width="2"/>
  <line x1="0" y1="${CELL}" x2="${SIZE}" y2="${CELL}" stroke="#ccc" stroke-width="2"/>
  <line x1="0" y1="${CELL * 2}" x2="${SIZE}" y2="${CELL * 2}" stroke="#ccc" stroke-width="2"/>
  ${digits}
</svg>`;
}

async function main() {
  const outputDir = path.join(__dirname, 'public');

  console.log(`Generating ${TOTAL_FRAMES} frames (${SIZE}x${SIZE})...`);
  const start = Date.now();

  // Initialize node-webpmux
  await WebP.Image.initLib();

  // Render SVG frames and encode as individual WebP buffers
  const frames = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const svg = Buffer.from(generateSvgFrame(i));
    const pngBuf = await sharp(svg).png().toBuffer();

    // Create a WebP image from raw RGBA pixels
    const img = await WebP.Image.getEmptyImage();
    // Render SVG → raw RGBA, then threshold to pure black/white for max compression
    const rawRGBA = await sharp(svg).ensureAlpha().raw().toBuffer();
    for (let p = 0; p < rawRGBA.length; p += 4) {
      const lum = rawRGBA[p]; // R channel (grayscale, R≈G≈B)
      const bw = lum > 160 ? 255 : 0; // threshold: keep text sharp, grid lines → white
      rawRGBA[p] = bw;
      rawRGBA[p + 1] = bw;
      rawRGBA[p + 2] = bw;
      // alpha stays 255
    }
    await img.setImageData(rawRGBA, {
      width: SIZE,
      height: SIZE,
      lossless: 4,
      method: 4
    });
    const webpBuf = await img.save(null);

    frames.push({
      buffer: webpBuf,
      delay: FRAME_DELAY
    });

    if ((i + 1) % 100 === 0) {
      console.log(`  Encoded ${i + 1}/${TOTAL_FRAMES} frames`);
    }
  }

  console.log(`Frames encoded in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log('Assembling animated WebP...');

  // Assemble animation
  const outputPath = path.join(outputDir, 'binary-grid.webp');
  const animBuf = await WebP.Image.save(null, {
    width: SIZE,
    height: SIZE,
    frames,
    loops: 0,
    bgColor: [255, 255, 255, 255]
  });

  await fs.writeFile(outputPath, animBuf);
  const info = await fs.stat(outputPath);

  console.log(`Done! Output: ${outputPath}`);
  console.log(`File size: ${(info.size / 1024).toFixed(1)} KB`);
  console.log(`Frames: ${TOTAL_FRAMES}, delay: ${FRAME_DELAY}ms, total: ${(TOTAL_FRAMES * FRAME_DELAY / 1000).toFixed(1)}s`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
