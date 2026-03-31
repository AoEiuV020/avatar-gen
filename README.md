# avatar-gen

个人头像生成器。通过代码生成动态头像，输出为 animated WebP 格式。

## 使用

```bash
pnpm install
pnpm build
```

生成的头像保存在 `public/avatar.webp`。

### 自定义尺寸

通过环境变量 `SCALE` 指定点阵放大倍数（默认 1，图片尺寸 = 27 × SCALE 左右）：

```bash
SCALE=6 pnpm build  # 生成约 252x252
```

## 项目结构

```
src/
├── index.js           # 入口，配置与流程编排
├── render.js          # 将数值序列渲染为 RGBA 帧
├── fonts/
│   └── bitmap-5x7.js  # 5×7 点阵字体
└── encoders/
    └── webp.js        # animated WebP 编码器
```

## 部署

推送到 GitHub 后，CI 自动构建并部署到 GitHub Pages。

需要在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**。

## 技术栈

| 组件 | 用途 |
|------|------|
| [node-webpmux](https://www.npmjs.com/package/node-webpmux) | 编码 animated WebP |
| GitHub Actions | CI 构建 + Pages 部署 |
