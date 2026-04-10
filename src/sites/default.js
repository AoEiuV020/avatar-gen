const FRAME_DELAY = 100;
const INTRO_DELAY = 1000;

module.exports = {
  build(staticFrame, frames) {
    // 首帧(静态值, 1000ms) + 计数(0→511, 各100ms)
    return {
      frames: [staticFrame, ...frames],
      delays: [INTRO_DELAY, ...Array(frames.length).fill(FRAME_DELAY)],
    };
  },
};
