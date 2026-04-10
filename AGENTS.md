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
- `src/circle.js` — 圆形内边距变换，给帧添加 padding 使内容落在正方形内切圆内
- `src/formats.js` — 格式注册表，定义所有格式 ID 及编码逻辑，自动派生圆形变体
- `src/fonts/bitmap-5x7.js` — 5×7 点阵字体定义
- `src/encoders/` — 各格式编码器（webp / gif / png / jpg）
- `src/sites/` — 网站专用动画变体，每个文件导出 `{ name?, formats?, build() }`
- `public/` — 构建产物输出目录（git 忽略，仅保留 HTML）
- `.github/workflows/deploy.yml` — CI 构建 + GitHub Pages 部署

## 核心逻辑

- 值域 0–511（9 位二进制），渲染为 3×3 网格，每格一个二进制位（`0` 或 `1`）
- 二进制字符串用 `padStart(9, '0')` 补前导零，确保始终填满 9 格
- `SCALE` 环境变量控制点阵放大倍数，默认 5
- `STATIC_VALUE` 环境变量控制静态帧使用的值，默认 20
- 动画帧序列由 `src/sites/` 下的变体模块定义，每个变体独立控制帧排列、延迟和输出格式

### 格式 ID 系统

- `src/formats.js` 定义 6 个基础格式（方形），自动派生 6 个圆形变体，共 12 个格式 ID
- 基础格式：`anim-webp`、`anim-gif`、`static-jpg`、`static-webp`、`static-png-black`、`static-png-white`
- 圆形变体：每个基础格式自动加 `circle-` 前缀，文件名中 `avatar` → `avatar-circle`
- 每个格式定义包含：`id`、`type`（animated/static）、`render`（数据源）、`circle`（是否圆形）、`filename`、`encode`

### 圆形内边距

- `src/circle.js` 对 RGBA 帧进行后处理：扩大画布，原始内容居中
- 新画布尺寸 = ⌈原尺寸 × √2 × (1 + margin)⌉，默认 margin=5%
- 确保 3×3 网格完全落在内切圆内，适配平台圆形裁剪

### Site 变体

- 每个 site 导出 `{ name?, formats?, build(staticFrame, frames) }`
- `name`：网站名（如 `'zhihu'`），自动加横线作前缀；不设则无前缀
- `formats`：需要的格式 ID 列表；不设则生成全部 12 个格式
- `build()`：接收静态帧和全部帧，返回 `{ frames, delays }` 动画序列

## 构建产物

### 默认变体（无前缀，全部 12 格式）

| 文件 | 格式 ID | 类型 |
|------|---------|------|
| `avatar.webp` | `anim-webp` | 动画 WebP |
| `avatar.gif` | `anim-gif` | 动画 GIF |
| `avatar.jpg` | `static-jpg` | 静态 JPG |
| `avatar-static.webp` | `static-webp` | 静态 WebP |
| `avatar-black.png` | `static-png-black` | 透明底黑字 PNG |
| `avatar-white.png` | `static-png-white` | 透明底白字 PNG |
| `avatar-circle.webp` | `circle-anim-webp` | 圆形动画 WebP |
| `avatar-circle.gif` | `circle-anim-gif` | 圆形动画 GIF |
| `avatar-circle.jpg` | `circle-static-jpg` | 圆形静态 JPG |
| `avatar-circle-static.webp` | `circle-static-webp` | 圆形静态 WebP |
| `avatar-circle-black.png` | `circle-static-png-black` | 圆形透明底黑字 PNG |
| `avatar-circle-white.png` | `circle-static-png-white` | 圆形透明底白字 PNG |

### 知乎变体（`zhihu-` 前缀）

| 文件 | 格式 ID | 类型 |
|------|---------|------|
| `zhihu-avatar.webp` | `anim-webp` | 动画 WebP（101帧填充确保静态提取正确） |
| `zhihu-avatar-circle.webp` | `circle-anim-webp` | 圆形动画 WebP |

## 边界

- ✅ **始终执行**：每次调整代码后运行 `pnpm build` 验证产物正确生成
- ✅ **始终执行**：算法逻辑（render.js、encoders/）有改动时，同步更新 AGENTS.md 的"核心逻辑"板块
- ⚠️ **先问再做**：修改帧数（`TOTAL_FRAMES`）、网格布局（3×3）、动画时序
- 🚫 **禁止**：将 `public/` 下的生成物提交到 git
