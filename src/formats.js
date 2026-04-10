const webp = require('./encoders/webp');
const gif = require('./encoders/gif');
const jpg = require('./encoders/jpg');
const png = require('./encoders/png');

const FORMATS = [
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

module.exports = FORMATS;
