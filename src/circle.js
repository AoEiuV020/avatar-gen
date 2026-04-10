/**
 * 圆形内边距变换
 * 在 RGBA 帧周围添加 padding，使原始内容完全落在正方形内切圆内
 */

/**
 * @param {Buffer[]} frames - RGBA 像素数据数组
 * @param {object} opts
 * @param {number} opts.width - 原始宽度
 * @param {number} opts.height - 原始高度
 * @param {number[]} opts.bg - 填充背景色 [r,g,b,a]
 * @param {number} [opts.margin=0.05] - 超出最小安全区的额外边距比例
 * @returns {{ frames: Buffer[], width: number, height: number }}
 */
function padFrames(frames, { width, height, bg, margin = 0.05 }) {
  let padSize = Math.ceil(width * Math.SQRT2 * (1 + margin));
  if ((padSize - width) % 2 !== 0) padSize++;

  const padX = (padSize - width) / 2;
  const padY = (padSize - height) / 2;

  const paddedFrames = frames.map(frame => {
    const buf = Buffer.alloc(padSize * padSize * 4);
    for (let i = 0; i < buf.length; i += 4) {
      buf[i] = bg[0]; buf[i + 1] = bg[1]; buf[i + 2] = bg[2]; buf[i + 3] = bg[3];
    }
    for (let y = 0; y < height; y++) {
      const srcOff = y * width * 4;
      const dstOff = ((padY + y) * padSize + padX) * 4;
      frame.copy(buf, dstOff, srcOff, srcOff + width * 4);
    }
    return buf;
  });

  return { frames: paddedFrames, width: padSize, height: padSize };
}

module.exports = { padFrames };
