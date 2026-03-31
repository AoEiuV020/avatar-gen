# avatar-gen

个人头像生成器。通过代码生成动态头像，输出为 animated WebP 格式。

## 使用

```bash
npm ci
node generate.js
```

生成的头像保存在 `public/avatar.webp`。

### 自定义尺寸

通过环境变量 `SCALE` 指定点阵放大倍数（默认 6，图片尺寸 = 27 × SCALE）：

```bash
SCALE=10 node generate.js  # 生成 270x270
```

## 部署

推送到 GitHub 后，CI 自动构建并部署到 GitHub Pages。

需要在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**。

## 技术栈

| 组件 | 用途 |
|------|------|
| [node-webpmux](https://www.npmjs.com/package/node-webpmux) | 编码 animated WebP |
| GitHub Actions | CI 构建 + Pages 部署 |
