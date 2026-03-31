/**
 * 将一组值渲染为 RGBA 帧序列
 * @param {number[]} values - 每帧要显示的数值
 * @param {object} font - 字体模块 { width, height, glyphs }
 * @param {number} scale - 每个字形像素映射为多少图片像素
 * @returns {{ frames: Buffer[], width: number, height: number }}
 */
function renderFrames(values, font, scale = 1) {
  const rawCell = font.height * scale * 2;
  const cell = rawCell + ((rawCell - font.width * scale) % 2);
  const size = 3 * cell;

  const frames = values.map(value => renderOne(value, font, scale, cell, size));
  return { frames, width: size, height: size };
}

function renderOne(value, font, scale, cell, size) {
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = 255; buf[i+1] = 255; buf[i+2] = 255; buf[i+3] = 255;
  }

  const bin = value.toString(2);
  for (let idx = 0; idx < bin.length; idx++) {
    const glyph = font.glyphs[bin[idx]];
    if (!glyph) continue;

    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const cx = col * cell + cell / 2;
    const cy = row * cell + cell / 2;
    const ox = Math.round(cx - (font.width * scale) / 2);
    const oy = Math.round(cy - (font.height * scale) / 2);

    for (let gy = 0; gy < font.height; gy++) {
      for (let gx = 0; gx < font.width; gx++) {
        if (!glyph[gy][gx]) continue;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = ox + gx * scale + sx;
            const py = oy + gy * scale + sy;
            if (px >= 0 && px < size && py >= 0 && py < size) {
              const i = (py * size + px) * 4;
              buf[i] = 0; buf[i+1] = 0; buf[i+2] = 0;
            }
          }
        }
      }
    }
  }
  return buf;
}

module.exports = { renderFrames };
