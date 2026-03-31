const path = require('path');
const fs = require('fs/promises');
const font = require('./fonts/bitmap-5x7');
const { renderFrames } = require('./render');
const { encode } = require('./encoders/webp');

const SCALE = parseInt(process.env.SCALE || '1');
const TOTAL_FRAMES = 512;
const FRAME_DELAY = 100;
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

async function main() {
  const values = Array.from({ length: TOTAL_FRAMES }, (_, i) => i);

  console.log(`Rendering ${TOTAL_FRAMES} frames (scale=${SCALE})...`);
  const start = Date.now();

  const { frames, width, height } = renderFrames(values, font, SCALE);
  console.log(`Rendered ${frames.length} frames (${width}x${height}) in ${((Date.now() - start) / 1000).toFixed(1)}s`);

  console.log('Encoding animated WebP...');
  const buf = await encode(frames, { width, height, delay: FRAME_DELAY });

  const outputPath = path.join(OUTPUT_DIR, 'avatar.webp');
  await fs.writeFile(outputPath, buf);
  const info = await fs.stat(outputPath);

  console.log(`Done! ${outputPath}`);
  console.log(`${(info.size / 1024).toFixed(1)} KB, ${TOTAL_FRAMES} frames, ${FRAME_DELAY}ms/frame`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
