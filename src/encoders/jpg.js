const jpeg = require('jpeg-js');

/**
 * 将单帧 RGBA 数据编码为 JPEG
 * 注意：JPEG 有损压缩对像素艺术效果较差（8×8 DCT 块会产生振铃噪点），
 * 仅用于需要 JPG 格式的场景，建议优先使用 PNG 或 WebP。
 * @param {Buffer} rgba - RGBA 像素数据
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.height
 * @param {number} [opts.quality=100] - JPEG 质量 (1-100)
 * @returns {Buffer} JPEG 文件数据
 */
function encode(rgba, { width, height, quality = 100 }) {
  const raw = { data: rgba, width, height };
  return jpeg.encode(raw, quality).data;
}

module.exports = { encode };
