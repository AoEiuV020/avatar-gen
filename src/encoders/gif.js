const { GIFEncoder, quantize, applyPalette } = require('gifenc');

/**
 * 将 RGBA 帧序列编码为 animated GIF
 * @param {Buffer[]} frames - RGBA 像素数据数组
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.height
 * @param {number} opts.delay - 每帧延迟 (ms)
 * @param {number} [opts.loops=0] - 循环次数，0=无限
 * @returns {Buffer} GIF 文件数据
 */
function encode(frames, { width, height, delay, loops = 0 }) {
  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i++) {
    const rgba = frames[i];
    const palette = quantize(rgba, 256);
    const index = applyPalette(rgba, palette);
    gif.writeFrame(index, width, height, {
      palette,
      delay,
      repeat: i === 0 ? loops : undefined,
    });

    if ((i + 1) % 100 === 0) {
      console.log(`  GIF: Encoded ${i + 1}/${frames.length} frames`);
    }
  }

  gif.finish();
  return Buffer.from(gif.bytes());
}

module.exports = { encode };
