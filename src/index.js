const path = require('path');
const fs = require('fs/promises');
const font = require('./fonts/bitmap-5x7');
const { renderFrames } = require('./render');
const webpEncoder = require('./encoders/webp');
const pngEncoder = require('./encoders/png');

const SCALE = parseInt(process.env.SCALE || '1');
const TOTAL_FRAMES = 512;
const FRAME_DELAY = 100;
const STATIC_VALUE = parseInt(process.env.STATIC_VALUE || '20');
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

async function main() {
  const values = Array.from({ length: TOTAL_FRAMES }, (_, i) => i);

  console.log(`Rendering ${TOTAL_FRAMES} frames (scale=${SCALE})...`);
  const start = Date.now();

  const { frames, width, height } = renderFrames(values, font, SCALE);
  console.log(`Rendered ${frames.length} frames (${width}x${height}) in ${((Date.now() - start) / 1000).toFixed(1)}s`);

  // Animated WebP
  console.log('Encoding animated WebP...');
  const webpBuf = await webpEncoder.encode(frames, { width, height, delay: FRAME_DELAY });
  const webpPath = path.join(OUTPUT_DIR, 'avatar.webp');
  await fs.writeFile(webpPath, webpBuf);
  const webpInfo = await fs.stat(webpPath);
  console.log(`WebP: ${webpPath} (${(webpInfo.size / 1024).toFixed(1)} KB)`);

  // Static PNG
  const staticFrame = frames[STATIC_VALUE];
  const pngBuf = pngEncoder.encode(staticFrame, { width, height });
  const pngPath = path.join(OUTPUT_DIR, 'avatar.png');
  await fs.writeFile(pngPath, pngBuf);
  const pngInfo = await fs.stat(pngPath);
  console.log(`PNG:  ${pngPath} (${(pngInfo.size / 1024).toFixed(1)} KB, value=${STATIC_VALUE})`);

  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
