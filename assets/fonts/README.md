# 字体文件目录

本目录用于存放博客系统使用的字体文件。

## 当前字体

- **主要字体**: 系统默认字体栈
- **代码字体**: 'Fira Code', 'Consolas', 'Monaco', monospace
- **图标字体**: Font Awesome 6.4.0

## 字体加载

字体通过以下方式加载：

1. **Google Fonts**: 通过CDN加载
2. **Font Awesome**: 通过npm包加载
3. **系统字体**: 使用系统默认字体栈

## 字体配置

字体配置在 `assets/css/style.css` 中定义：

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
}
```

## 添加新字体

如需添加新字体，请：

1. 将字体文件放入此目录
2. 在 `assets/css/style.css` 中定义 `@font-face`
3. 更新CSS变量中的字体栈

## 性能优化

- 使用 `font-display: swap` 优化字体加载
- 预加载关键字体
- 使用字体子集化减少文件大小 