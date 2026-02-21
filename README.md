# image-to-base64

将图片文件转换为 Base64 编码，方便直接插入 CSS（如 `background-image` / `mask-image`）或 HTML 中使用。([github.com](https://github.com/yangtianxia/image-to-base64))

---

## 📌 功能介绍

`image-to-base64` 是一个简单的 **图片转 Base64 工具**，主要用于：

- 将本地图片转换为 Base64 字符串
- 支持在 CSS 中快速使用 Base64 图片（如 `background-image`, `mask-image`）([github.com](https://github.com/yangtianxia/image-to-base64))

该工具适合前端开发、样式调试、快速测试等场景。  

---

## 🚀 特性

- ✨ 将常见图片格式快速编码为 Base64  
- ✨ 生成可直接在 CSS/HTML 中使用的 Data URI  
- ✨ 前端兼容性好，无需服务器处理  
- ✨ 释放对外部资源文件的依赖，提高小资源加载性能

---

## 📌 使用说明

### 🖼 在浏览器中打开

1. 打开 `[image-to-base64](https://yangtianxia.github.io/image-to-base64/)`
2. 拖放图片或使用文件选择控件加载图片  
3. 自动生成 Base64 编码字符串  
4. 复制用于 CSS/HTML

---

## 🛠 支持的输出用法

以下示例说明如何将生成的 Base64 字符串嵌入到不同位置：

### 🎨 在 CSS 中使用

```css
.my-class {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANS…");
}
```

或用于遮罩：

```css
.my-mask {
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0…");
}
```

---

### 🖼 在 HTML 中使用

```html
<img src="data:image/jpeg;base64,/9j/4AAQSk…==" alt="base64 图像" />
```

---

## ❓ 为什么需要 Base64 图片？

Base64 图片编码常用于：

- 嵌入小图片资源减少网络请求
- 在单文件组件或 Markdown 中嵌入图像
- 在 CSS 中快速内联图像，无需外部资源
- 编写示例 / 文档 / 快速原型样式

---

## 📦 示例

**从图片获得 Base64 字符串（伪代码）：**

```javascript
const fileInput = document.querySelector("input[type=file]");
fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = () => {
    const base64 = reader.result;
    console.log(base64) // 输出 base64
  };

  reader.readAsDataURL(file); // 读取为 Data URI
});
```

---

## 🧪 实践技巧

💡 在 CSS 中使用 Base64 可以避免多次网络请求，但对于大图建议仍采用外部请求  
💡 仅在需要“单文件打包”或快速原型测试时使用 Base64 图像
