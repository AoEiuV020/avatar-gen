const FRAME_DELAY = 100;

// 知乎上传动图后静态展示取帧索引100（第101帧），
// 用101帧填充开头，确保索引100仍为静态值
// 填充帧延迟需 > 10ms，否则浏览器会提升到100ms（Chromium Issue #41155333）
const PAD_COUNT = 101;
const PAD_DELAY = 11;

module.exports = {
  prefix: 'zhihu-',
  formats: ['webp'],
  build(staticFrame, frames) {
    return {
      frames: [...Array(PAD_COUNT).fill(staticFrame), ...frames],
      delays: [...Array(PAD_COUNT).fill(PAD_DELAY), ...Array(frames.length).fill(FRAME_DELAY)],
    };
  },
};
