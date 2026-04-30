# image-to-base64

在线将图片转为 Base64 Data URL，全程本地处理，不上传服务器。

[在线使用 →](https://yangtianxia.github.io/image-to-base64/)

---

## 为什么用这个工具

- **隐私安全**：所有转换在浏览器内完成，图片不会离开你的设备
- **批量支持**：一次最多上传 10 张图片，批量转换后可分别复制
- **历史记录**：每次转换自动保存到本地 IndexedDB，下次打开仍可查看，支持一键复用参数重转
- **多格式输出**：支持纯 Base64、CSS `background-image`、HTML `<img>` 三种格式，开箱即用

---

## 支持格式

| 格式 | MIME | 说明 |
|------|------|------|
| JPG | `image/jpeg` | 有损压缩，支持质量调节 |
| PNG | `image/png` | 无损，支持最大宽度缩放 |
| SVG | `image/svg+xml` | 矢量图，支持双引号模式 |
| GIF | `image/gif` | 动图直接读取 |
| WebP | `image/webp` | 现代格式，直接读取 |
| AVIF | `image/avif` | 高压缩现代格式，直接读取 |
| BMP | `image/bmp` | 位图，经 Canvas 压缩为 JPEG 输出 |
| ICO | `image/x-icon` | favicon 常用格式，直接读取 |

---

## 主要功能

- **上传 / 拖拽 / 粘贴**：支持点击选择、拖拽到页面、Ctrl+V 粘贴截图
- **批量转换**：同时处理多张图片，结果可展开查看，支持折叠
- **参数调整**
  - JPG / BMP：最大宽度 + 压缩质量（0.1–1.0）
  - PNG：最大宽度缩放（无损）
  - SVG：双引号模式（将单引号替换为双引号，适配特定场景）
- **粘贴 SVG 代码**：切换「粘贴代码」Tab，直接粘贴 SVG 源码或已有 Data URL
- **多格式输出**：纯 Base64 / CSS `url(...)` / HTML `<img src="...">`
- **本地历史**：基于 IndexedDB 存储，记录每个文件最近 3 次转换配置，支持一键重转
- **暗色模式**：跟随系统自动切换

---

## 快速开始

1. 打开 [https://yangtianxia.github.io/image-to-base64/](https://yangtianxia.github.io/image-to-base64/)
2. 拖拽图片或点击上传区选择文件
3. 根据需要调整最大宽度和压缩质量
4. 选择输出格式，点击「复制」

---

## 输出格式示例

**纯 Base64**
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

**CSS**
```css
.icon {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...");
}
```

**HTML**
```html
<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgAB..." alt="" />
```
