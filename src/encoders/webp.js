const WebP = require('node-webpmux');

/**
 * 将 RGBA 帧序列编码为 animated WebP
 * @param {Buffer[]} frames - RGBA 像素数据数组
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.height
 * @param {number} opts.delay - 每帧延迟 (ms)
 * @param {number} [opts.loops=0] - 循环次数，0=无限
 * @returns {Promise<Buffer>} WebP 文件数据
 */
async function encode(frames, { width, height, delay, loops = 0 }) {
  await WebP.Image.initLib();

  const webpFrames = [];
  for (let i = 0; i < frames.length; i++) {
    const img = await WebP.Image.getEmptyImage();
    await img.setImageData(frames[i], {
      width,
      height,
      lossless: 4,
      method: 4,
    });
    webpFrames.push({ buffer: await img.save(null), delay });

    if ((i + 1) % 100 === 0) {
      console.log(`  WebP: Encoded ${i + 1}/${frames.length} frames`);
    }
  }

  return WebP.Image.save(null, {
    width,
    height,
    frames: webpFrames,
    loops,
    bgColor: [255, 255, 255, 255],
  });
}

/**
 * 将单帧 RGBA 数据编码为静态 WebP
 * @param {Buffer} rgba - RGBA 像素数据
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.height
 * @returns {Promise<Buffer>} WebP 文件数据
 */
async function encodeStatic(rgba, { width, height }) {
  await WebP.Image.initLib();
  const img = await WebP.Image.getEmptyImage();
  await img.setImageData(rgba, { width, height, lossless: 4, method: 4 });
  return img.save(null);
}

module.exports = { encode, encodeStatic };
