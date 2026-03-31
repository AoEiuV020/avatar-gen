const WebP = require('node-webpmux');
const path = require('path');
const fs = require('fs/promises');

const SCALE = parseInt(process.env.SCALE || '1');
const GLYPH_W = 5;
const GLYPH_H = 7;
// 字形占格子高度的 ~50%，与 SIZE=250 版本的留白比例一致
const RAW_CELL = GLYPH_H * SCALE * 2;
const CELL = RAW_CELL + ((RAW_CELL - GLYPH_W * SCALE) % 2); // 保证居中偏移为整数
const SIZE = 3 * CELL;
const TOTAL_FRAMES = 512;
const FRAME_DELAY = 100; // ms

// 5x7 bitmap font for digits 0 and 1 (1=black, 0=white)
const FONT = {
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,1,1],
    [1,0,1,0,1],
    [1,1,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '1': [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
  ],
};

function drawFrame(value) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  // Fill white with full alpha
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = 255; buf[i+1] = 255; buf[i+2] = 255; buf[i+3] = 255;
  }

  const bin = value.toString(2);
  for (let idx = 0; idx < bin.length; idx++) {
    const glyph = FONT[bin[idx]];
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const cx = col * CELL + CELL / 2;
    const cy = row * CELL + CELL / 2;
    const ox = Math.round(cx - (GLYPH_W * SCALE) / 2);
    const oy = Math.round(cy - (GLYPH_H * SCALE) / 2);

    for (let gy = 0; gy < GLYPH_H; gy++) {
      for (let gx = 0; gx < GLYPH_W; gx++) {
        if (!glyph[gy][gx]) continue;
        for (let sy = 0; sy < SCALE; sy++) {
          for (let sx = 0; sx < SCALE; sx++) {
            const px = ox + gx * SCALE + sx;
            const py = oy + gy * SCALE + sy;
            if (px >= 0 && px < SIZE && py >= 0 && py < SIZE) {
              const i = (py * SIZE + px) * 4;
              buf[i] = 0; buf[i+1] = 0; buf[i+2] = 0;
            }
          }
        }
      }
    }
  }
  return buf;
}

async function main() {
  const outputDir = path.join(__dirname, 'public');

  console.log(`Generating ${TOTAL_FRAMES} frames (${SIZE}x${SIZE}, scale=${SCALE})...`);
  const start = Date.now();

  await WebP.Image.initLib();

  const frames = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const rgba = drawFrame(i);
    const img = await WebP.Image.getEmptyImage();
    await img.setImageData(rgba, {
      width: SIZE,
      height: SIZE,
      lossless: 4,
      method: 4
    });
    frames.push({ buffer: await img.save(null), delay: FRAME_DELAY });

    if ((i + 1) % 100 === 0) {
      console.log(`  Encoded ${i + 1}/${TOTAL_FRAMES} frames`);
    }
  }

  console.log(`Frames encoded in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log('Assembling animated WebP...');

  const outputPath = path.join(outputDir, 'avatar.webp');
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
