const path = require('path');
const fs = require('fs/promises');
const font = require('./fonts/bitmap-5x7');
const { renderFrames } = require('./render');
const webpEncoder = require('./encoders/webp');
const gifEncoder = require('./encoders/gif');
const jpgEncoder = require('./encoders/jpg');
const pngEncoder = require('./encoders/png');

const SCALE = parseInt(process.env.SCALE || '5');
const TOTAL_FRAMES = 512;
const FRAME_DELAY = 100;
const OUTRO_DELAY = 1000;
const STATIC_VALUE = parseInt(process.env.STATIC_VALUE || '20');
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

async function writeOutput(name, data) {
  const filePath = path.join(OUTPUT_DIR, name);
  await fs.writeFile(filePath, data);
  const info = await fs.stat(filePath);
  console.log(`  ${name} (${(info.size / 1024).toFixed(1)} KB)`);
}

async function main() {
  const allValues = Array.from({ length: TOTAL_FRAMES }, (_, i) => i);

  console.log(`Rendering ${TOTAL_FRAMES} frames (scale=${SCALE})...`);
  const start = Date.now();

  // 白底黑字帧（动画 + 静态不透明用）
  const opaque = renderFrames(allValues, font, SCALE);
  // 透明底黑字（单帧）
  const transBlack = renderFrames([STATIC_VALUE], font, SCALE, {
    bg: [0, 0, 0, 0], fg: [0, 0, 0, 255],
  });
  // 透明底白字（单帧）
  const transWhite = renderFrames([STATIC_VALUE], font, SCALE, {
    bg: [0, 0, 0, 0], fg: [255, 255, 255, 255],
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Rendered ${opaque.frames.length + 2} frames (${opaque.width}x${opaque.height}) in ${elapsed}s`);

  const { frames, width, height } = opaque;
  const staticFrame = frames[STATIC_VALUE];

  // 动画帧序列：首帧(20, 100ms) + 计数(0→511, 各100ms) + 尾帧(20, 1000ms)
  const animFrames = [staticFrame, ...frames, staticFrame];
  const animDelays = [
    FRAME_DELAY,
    ...Array(TOTAL_FRAMES).fill(FRAME_DELAY),
    OUTRO_DELAY,
  ];

  console.log('Encoding outputs...');

  // 1. 动画 WebP
  const webpBuf = await webpEncoder.encode(animFrames, { width, height, delay: animDelays });
  await writeOutput('avatar.webp', webpBuf);

  // 2. 动画 GIF
  const gifBuf = gifEncoder.encode(animFrames, { width, height, delay: animDelays });
  await writeOutput('avatar.gif', gifBuf);

  // 3. 静态 JPG
  const jpgBuf = jpgEncoder.encode(staticFrame, { width, height });
  await writeOutput('avatar.jpg', jpgBuf);

  // 4. 静态 WebP
  const staticWebpBuf = await webpEncoder.encodeStatic(staticFrame, { width, height });
  await writeOutput('avatar-static.webp', staticWebpBuf);

  // 5. 透明底黑字 PNG
  const blackPngBuf = pngEncoder.encode(transBlack.frames[0], { width, height });
  await writeOutput('avatar-black.png', blackPngBuf);

  // 6. 透明底白字 PNG
  const whitePngBuf = pngEncoder.encode(transWhite.frames[0], { width, height });
  await writeOutput('avatar-white.png', whitePngBuf);

  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
