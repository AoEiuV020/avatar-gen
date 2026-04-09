# AGENTS.md

## 命令

- 安装依赖：`pnpm install`
- 构建（生成所有头像产物）：`pnpm build`
- 自定义尺寸构建：`SCALE=6 pnpm build`

## 技术栈

Node.js 20, pnpm, 纯 JS（无 TypeScript）

依赖：gifenc（GIF 编码）、jpeg-js（JPEG 编码）、node-webpmux（WebP 编码）

## 项目结构

- `src/index.js` — 入口，配置参数与流程编排，自动加载 `sites/` 下的变体
- `src/render.js` — 将数值序列渲染为 RGBA 帧（3×3 网格布局，每格显示二进制位）
- `src/fonts/bitmap-5x7.js` — 5×7 点阵字体定义
- `src/encoders/` — 各格式编码器（webp / gif / png / jpg）
- `src/sites/` — 网站专用动画变体，每个文件导出 `{ prefix, formats?, build() }`
- `public/` — 构建产物输出目录（git 忽略，仅保留 HTML）
- `.github/workflows/deploy.yml` — CI 构建 + GitHub Pages 部署

## 核心逻辑

- 值域 0–511（9 位二进制），渲染为 3×3 网格，每格一个二进制位（`0` 或 `1`）
- 二进制字符串用 `padStart(9, '0')` 补前导零，确保始终填满 9 格
- `SCALE` 环境变量控制点阵放大倍数，默认 5
- `STATIC_VALUE` 环境变量控制静态帧使用的值，默认 20
- 动画帧序列由 `src/sites/` 下的变体模块定义，每个变体独立控制帧排列、延迟和输出格式

## 构建产物

| 文件 | 类型 |
|------|------|
| `avatar.webp` | 动画 WebP（默认变体） |
| `avatar.gif` | 动画 GIF（默认变体） |
| `zhihu-avatar.webp` | 动画 WebP（知乎变体，101帧填充确保静态提取正确） |
| `avatar.jpg` | 静态 JPG（白底黑字） |
| `avatar-static.webp` | 静态 WebP |
| `avatar-black.png` | 透明底黑字 PNG |
| `avatar-white.png` | 透明底白字 PNG |

## 边界

- ✅ **始终执行**：每次调整代码后运行 `pnpm build` 验证产物正确生成
- ✅ **始终执行**：算法逻辑（render.js、encoders/）有改动时，同步更新 AGENTS.md 的"核心逻辑"板块
- ⚠️ **先问再做**：修改帧数（`TOTAL_FRAMES`）、网格布局（3×3）、动画时序
- 🚫 **禁止**：将 `public/` 下的生成物提交到 git
