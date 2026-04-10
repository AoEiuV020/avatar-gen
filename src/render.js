/**
 * 将一组值渲染为 RGBA 帧序列
 * @param {number[]} values - 每帧要显示的数值
 * @param {object} font - 字体模块 { width, height, glyphs }
 * @param {number} scale - 每个字形像素映射为多少图片像素
 * @param {object} [opts]
 * @param {number[]} [opts.bg=[255,255,255,255]] - 背景色 [r,g,b,a]
 * @param {number[]} [opts.fg=[0,0,0,255]] - 前景色 [r,g,b,a]
 * @returns {{ frames: Buffer[], width: number, height: number }}
 */
function renderFrames(values, font, scale = 1, { bg = [255,255,255,255], fg = [0,0,0,255] } = {}) {
  const rawCell = font.height * scale * 2;
  const cell = rawCell + ((rawCell - font.width * scale) % 2);
  const size = 3 * cell;

  // space-evenly: 边缘和字形之间等间距
  const glyphW = font.width * scale;
  const glyphH = font.height * scale;
  const gapX = (size - 3 * glyphW) / 4;
  const gapY = (size - 3 * glyphH) / 4;
  const layout = { size, glyphW, glyphH, gapX, gapY };

  const frames = values.map(value => renderOne(value, font, scale, layout, bg, fg));
  return { frames, width: size, height: size };
}

function renderOne(value, font, scale, layout, bg, fg) {
  const { size, glyphW, glyphH, gapX, gapY } = layout;
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = bg[0]; buf[i+1] = bg[1]; buf[i+2] = bg[2]; buf[i+3] = bg[3];
  }

  const bin = value.toString(2).padStart(9, '0');
  for (let idx = 0; idx < bin.length; idx++) {
    const glyph = font.glyphs[bin[idx]];
    if (!glyph) continue;

    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const ox = Math.round((col + 1) * gapX + col * glyphW);
    const oy = Math.round((row + 1) * gapY + row * glyphH);

    for (let gy = 0; gy < font.height; gy++) {
      for (let gx = 0; gx < font.width; gx++) {
        if (!glyph[gy][gx]) continue;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = ox + gx * scale + sx;
            const py = oy + gy * scale + sy;
            if (px >= 0 && px < size && py >= 0 && py < size) {
              const i = (py * size + px) * 4;
              buf[i] = fg[0]; buf[i+1] = fg[1]; buf[i+2] = fg[2]; buf[i+3] = fg[3];
            }
          }
        }
      }
    }
  }
  return buf;
}

module.exports = { renderFrames };
