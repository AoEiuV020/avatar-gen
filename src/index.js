const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const font = require('./fonts/bitmap-5x7');
const { renderFrames } = require('./render');
const webpEncoder = require('./encoders/webp');
const gifEncoder = require('./encoders/gif');
const jpgEncoder = require('./encoders/jpg');
const pngEncoder = require('./encoders/png');

const SCALE = parseInt(process.env.SCALE || '5');
const TOTAL_FRAMES = 512;
const STATIC_VALUE = parseInt(process.env.STATIC_VALUE || '20');
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

// 自动加载 sites/ 下所有变体
const SITES_DIR = path.join(__dirname, 'sites');
const variants = fsSync.readdirSync(SITES_DIR)
  .filter(f => f.endsWith('.js'))
  .map(f => ({ name: f.replace('.js', ''), ...require(path.join(SITES_DIR, f)) }));

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

  console.log('Encoding outputs...');

  // 按变体生成动画
  for (const variant of variants) {
    const anim = variant.build(staticFrame, frames);
    const fmts = variant.formats || ['webp', 'gif'];
    console.log(`  [${variant.name}] ${anim.frames.length} frames → ${fmts.join(', ')}`);

    if (fmts.includes('webp')) {
      const webpBuf = await webpEncoder.encode(anim.frames, { width, height, delay: anim.delays });
      await writeOutput(`${variant.prefix}avatar.webp`, webpBuf);
    }

    if (fmts.includes('gif')) {
      const gifBuf = gifEncoder.encode(anim.frames, { width, height, delay: anim.delays });
      await writeOutput(`${variant.prefix}avatar.gif`, gifBuf);
    }
  }

  // 静态产物（与变体无关）
  const jpgBuf = jpgEncoder.encode(staticFrame, { width, height });
  await writeOutput('avatar.jpg', jpgBuf);

  const staticWebpBuf = await webpEncoder.encodeStatic(staticFrame, { width, height });
  await writeOutput('avatar-static.webp', staticWebpBuf);

  const blackPngBuf = pngEncoder.encode(transBlack.frames[0], { width, height });
  await writeOutput('avatar-black.png', blackPngBuf);

  const whitePngBuf = pngEncoder.encode(transWhite.frames[0], { width, height });
  await writeOutput('avatar-white.png', whitePngBuf);

  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
