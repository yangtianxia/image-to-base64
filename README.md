# image-to-base64

在线将图片转为 Base64 Data URL，全程本地处理，不上传服务器。

[在线使用 →](https://yangtianxia.github.io/image-to-base64/)

---

## 为什么需要把图片转成 Base64？

在这些开发场景中，你**无法直接引用本地图片**，只能用 Base64 或网络图片：

### 微信小程序

小程序的样式文件（WXSS）**不支持本地图片路径**，`background-image` 只接受网络图片或 Base64：

```css
/* ❌ 不支持 */
.icon { background-image: url("/images/logo.png"); }

/* ✅ 可以 */
.icon { background-image: url("data:image/png;base64,iVBORw0KGgo..."); }
```

SVG 图标在小程序中同样必须转为 Base64 才能在样式中使用。

### CSS mask-image 图标方案

用 SVG 做图标遮罩，配合 `background-color` 实现任意颜色切换——这是目前最灵活的 CSS 图标方案，**必须使用 Base64**：

```css
.icon-arrow {
  background-color: currentColor;  /* 颜色跟随父元素文字颜色 */
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxu...");
  mask-size: contain;
  mask-repeat: no-repeat;
}
```

> SVG 转 Base64 在这个场景中用途最广，因为矢量图可以任意缩放，且 Base64 体积小、颜色可控。

### 邮件 HTML

邮件客户端通常屏蔽外部图片请求，将图片嵌入为 Base64 可保证图片始终显示：

```html
<img src="data:image/png;base64,iVBORw0KGgo..." alt="logo" />
```

### 单文件 HTML / 独立 Demo

把图片内联进 HTML，分发时只需一个文件，不依赖外部资源：

```html
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxu..." />
```

### Canvas 跨域限制

从外部 URL 加载的图片会触发 Canvas 跨域污染，导致 `toDataURL()` 报错；改用 Base64 可完全避免跨域问题。

### Favicon 动态设置

现代浏览器支持直接将 SVG Base64 作为 favicon，无需额外文件：

```html
<link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxu..." />
```

---

## SVG 转 Base64 的额外优势

SVG 是矢量格式，转成 Base64 后：

- 任意分辨率清晰显示，无需准备多套尺寸
- 体积通常远小于同等效果的 PNG/JPG
- 配合 `mask-image` 可用 CSS 控制颜色，不再需要维护多色版本
- 支持「双引号模式」，适配对引号格式有要求的框架或模板

---

## 支持格式

| 格式 | 说明 |
|------|------|
| JPG | 有损压缩，支持质量调节 |
| PNG | 无损，支持最大宽度缩放 |
| SVG | 矢量图，支持双引号模式 |
| GIF | 动图直接读取 |
| WebP | 现代格式，直接读取 |
| AVIF | 高压缩现代格式，直接读取 |
| BMP | 位图，经 Canvas 压缩为 JPEG 输出 |
| ICO | favicon 常用格式，直接读取 |

---

## 主要功能

- **上传 / 拖拽 / 粘贴**：支持点击选择、拖拽到页面、Ctrl+V 粘贴截图
- **批量转换**：同时处理最多 10 张图片
- **参数调整**：JPG/BMP 支持压缩质量 + 最大宽度；PNG 支持缩放；SVG 支持双引号模式
- **粘贴 SVG 代码**：直接粘贴 SVG 源码或已有 Data URL 进行处理
- **多格式输出**：纯 Base64 / CSS `url(...)` / HTML `<img src="...">`
- **转换历史**：本地 IndexedDB 存储，记录最近 3 次转换配置，支持一键重转
- **暗色模式**：跟随系统自动切换

---

## 快速开始

1. 打开 [https://yangtianxia.github.io/image-to-base64/](https://yangtianxia.github.io/image-to-base64/)
2. 拖拽图片或点击上传区选择文件
3. 根据需要调整最大宽度和压缩质量
4. 选择输出格式，点击「复制」
