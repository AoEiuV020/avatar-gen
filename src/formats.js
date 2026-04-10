const webp = require('./encoders/webp');
const gif = require('./encoders/gif');
const jpg = require('./encoders/jpg');
const png = require('./encoders/png');

// 基础格式（方形）
const BASE = [
  { id: 'anim-webp', type: 'animated', render: 'opaque', filename: 'avatar.webp',
    encode: (anim, d) => webp.encode(anim.frames, { ...d, delay: anim.delays }) },
  { id: 'anim-gif', type: 'animated', render: 'opaque', filename: 'avatar.gif',
    encode: (anim, d) => gif.encode(anim.frames, { ...d, delay: anim.delays }) },

  { id: 'static-jpg', type: 'static', render: 'opaque', filename: 'avatar.jpg',
    encode: (f, d) => jpg.encode(f, d) },
  { id: 'static-webp', type: 'static', render: 'opaque', filename: 'avatar-static.webp',
    encode: (f, d) => webp.encodeStatic(f, d) },
  { id: 'static-png-black', type: 'static', render: 'trans-black', filename: 'avatar-black.png',
    encode: (f, d) => png.encode(f, d) },
  { id: 'static-png-white', type: 'static', render: 'trans-white', filename: 'avatar-white.png',
    encode: (f, d) => png.encode(f, d) },
];

// 自动派生圆形变体：id 加 circle- 前缀，文件名 avatar → avatar-circle
const CIRCLE = BASE.map(fmt => ({
  ...fmt,
  id: `circle-${fmt.id}`,
  circle: true,
  filename: fmt.filename.replace('avatar', 'avatar-circle'),
}));

const ALL = [...BASE, ...CIRCLE];

module.exports = ALL;
