# 字体文件目录

该目录包含月光云海博客系统使用的自定义字体文件。

## 使用的字体

- **Roboto**: 主要正文字体
- **Montserrat**: 标题字体
- **JetBrains Mono**: 代码字体

## 字体格式

每种字体应包含以下格式以确保跨浏览器兼容性：
- .woff2（首选，体积最小）
- .woff（广泛支持）
- .ttf（用于旧版浏览器）

## 字体许可

请确保所有使用的字体都有适当的许可证。目前使用的字体都是开源的，可免费用于商业用途：

- Roboto: Apache License 2.0
- Montserrat: SIL Open Font License
- JetBrains Mono: Apache License 2.0

## 添加字体步骤

1. 将字体文件添加到此目录
2. 在CSS中添加@font-face声明
3. 更新字体配置

## 示例用法

```css
@font-face {
  font-family: 'Roboto';
  src: url('../fonts/Roboto-Regular.woff2') format('woff2'),
       url('../fonts/Roboto-Regular.woff') format('woff'),
       url('../fonts/Roboto-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
``` 