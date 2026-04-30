# image-to-base64

在线将图片转为 Base64 Data URL，全程本地处理，不上传服务器。

[在线使用 →](https://yangtianxia.github.io/image-to-base64/)

---

## 为什么需要 Base64 图片？

### 受限平台：样式文件不允许引用本地图片

微信/支付宝/字节跳动等小程序平台，CSS 样式文件**不支持本地路径图片**，只能用网络图片或 Base64。当图标不值得上传 CDN，或需要离线可用时，Base64 是唯一选择：

```css
/* 小程序 WXSS - 只有这两种写法有效 */
.icon { background-image: url("https://cdn.example.com/icon.png"); }
.icon { background-image: url("data:image/png;base64,iVBORw0KGgo..."); }
```

Chrome 扩展、Electron 应用打包后同样存在类似的路径引用限制，Base64 可以绕开路径解析问题。

### CSS mask-image 图标染色方案

这是目前最主流的纯 CSS 图标方案：用 SVG 做遮罩，`background-color` 控制颜色，一套图标可以呈现任意颜色，无需维护多色版本。**这个方案必须用 Base64**，直接引用 SVG 文件在多数浏览器下无法生效：

```css
.icon {
  background-color: currentColor;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxu...");
  mask-size: contain;
  mask-repeat: no-repeat;
}

/* 颜色切换只需改 color */
.icon--primary { color: #6366f1; }
.icon--danger   { color: #ef4444; }
```

SVG 转 Base64 在这个场景里用途最广：矢量图任意缩放不失真，且 SVG 文件本身体积小，转成 Base64 后增加的体积有限。

### 邮件 HTML

绝大多数邮件客户端默认屏蔽外部图片加载，图片必须内联为 Base64 才能保证收件方看到：

```html
<img src="data:image/png;base64,iVBORw0KGgo..." alt="logo" />
```

### 单文件独立分发

将图片内联到 HTML，分发时只需一个文件——适用于离线文档、可分享的 Demo 页面、导出报告等场景，无需维护配套的图片目录：

```html
<!-- 一个 HTML 文件包含所有内容，不依赖外部资源 -->
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxu..." />
```

---

## SVG 转 Base64 的额外优势

SVG 是矢量格式，转成 Base64 后比位图格式更实用：

- 任意分辨率清晰显示，无需准备 2x / 3x 多套尺寸
- 配合 `mask-image` 用 CSS 控制颜色，一份资源覆盖所有状态
- 文件体积通常远小于同效果的 PNG，内联后对页面体积影响小
- 可直接作为 Favicon：`<link rel="icon" href="data:image/svg+xml;base64,...">`

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
