const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const font = require('./fonts/bitmap-5x7');
const { renderFrames } = require('./render');
const formats = require('./formats');

const SCALE = parseInt(process.env.SCALE || '5');
const TOTAL_FRAMES = 512;
const STATIC_VALUE = parseInt(process.env.STATIC_VALUE || '20');
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

// 自动加载 sites/ 下所有变体
const SITES_DIR = path.join(__dirname, 'sites');
const variants = fsSync.readdirSync(SITES_DIR)
  .filter(f => f.endsWith('.js'))
  .map(f => require(path.join(SITES_DIR, f)));

// 格式注册表
const formatMap = new Map(formats.map(f => [f.id, f]));
const ALL_FORMAT_IDS = formats.map(f => f.id);

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

  // 渲染所有帧
  const opaque = renderFrames(allValues, font, SCALE);
  const transBlack = renderFrames([STATIC_VALUE], font, SCALE, {
    bg: [0, 0, 0, 0], fg: [0, 0, 0, 255],
  });
  const transWhite = renderFrames([STATIC_VALUE], font, SCALE, {
    bg: [0, 0, 0, 0], fg: [255, 255, 255, 255],
  });

  const renderData = {
    opaque,
    'trans-black': transBlack,
    'trans-white': transWhite,
  };

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Rendered in ${elapsed}s (${opaque.width}x${opaque.height})`);

  console.log('Encoding outputs...');

  for (const variant of variants) {
    const prefix = variant.name ? `${variant.name}-` : '';
    const fmtIds = variant.formats || ALL_FORMAT_IDS;
    const label = variant.name || 'default';
    console.log(`  [${label}] ${fmtIds.length} formats`);

    for (const fmtId of fmtIds) {
      const fmt = formatMap.get(fmtId);
      if (!fmt) {
        console.warn(`  ⚠ Unknown format: ${fmtId}`);
        continue;
      }

      const { frames, width, height } = renderData[fmt.render];

      let data;
      if (fmt.type === 'animated') {
        const staticFrame = frames[STATIC_VALUE];
        const anim = variant.build(staticFrame, frames);
        data = await fmt.encode(anim, { width, height });
      } else {
        const frame = fmt.render === 'opaque' ? frames[STATIC_VALUE] : frames[0];
        data = await fmt.encode(frame, { width, height });
      }

      await writeOutput(`${prefix}${fmt.filename}`, data);
    }
  }

  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
