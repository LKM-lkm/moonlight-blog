# 文件管理方案

## 📁 项目结构

```
moonlight-blog/
├── 📁 源码目录（开发用）
│   ├── index.html              # 主页源码
│   ├── article.html            # 文章页源码
│   ├── assets/                 # 静态资源源码
│   │   ├── css/               # 样式文件
│   │   ├── js/                # JavaScript 文件
│   │   ├── images/            # 图片资源
│   │   └── fonts/             # 字体文件
│   └── admin/                 # 后台源码
│       ├── dashboard/         # 仪表盘页面
│       ├── views/             # 后台管理页面
│       └── assets/            # 后台专用资源
├── 📁 部署目录（唯一部署源）
│   ├── dist/                  # 构建产物
│   │   ├── index.html         # 主页
│   │   ├── article.html       # 文章页
│   │   ├── assets/            # 静态资源
│   │   └── admin/             # 后台页面
│   └── scripts/               # 构建脚本
└── 📄 配置文件
    ├── package.json           # 项目配置
    ├── .gitignore            # Git 忽略规则
    └── wrangler.toml         # Cloudflare 配置
```

## 🚀 构建流程

### 自动构建
```bash
# 构建 dist 目录
npm run build:dist

# 构建并部署（自动提交到 Git）
npm run deploy
```

### 手动构建
```bash
# 运行构建脚本
node scripts/build.js
```

## 📋 文件管理规则

### ✅ 允许的文件
- **源码文件**：根目录下的所有开发文件
- **构建产物**：`dist/` 目录（唯一部署源）
- **配置文件**：`package.json`、`.gitignore` 等

### ❌ 禁止的文件
- **重复部署目录**：`public/admin/`、`public/assets/` 等
- **临时文件**：`*.tmp`、`*.temp` 等
- **构建缓存**：`node_modules/`、`.wrangler/` 等

## 🔧 路径引用规范

### 静态资源路径
```html
<!-- ✅ 正确：使用绝对路径 -->
<link rel="stylesheet" href="/assets/css/style.css">
<script src="/assets/js/main.js"></script>
<img src="/assets/images/avatar.jpg">

<!-- ❌ 错误：使用相对路径 -->
<link rel="stylesheet" href="../assets/css/style.css">
<script src="../../assets/js/main.js"></script>
```

### 页面链接
```html
<!-- ✅ 正确：使用绝对路径 -->
<a href="/admin/dashboard/">仪表盘</a>
<a href="/admin/views/articles.html">文章管理</a>

<!-- ❌ 错误：使用相对路径 -->
<a href="../admin/dashboard/">仪表盘</a>
<a href="../../admin/views/articles.html">文章管理</a>
```

## 🛠️ 开发工作流

### 1. 开发阶段
- 在根目录的源码文件中进行开发
- 修改 `assets/`、`admin/` 等源码目录
- 使用相对路径进行开发测试

### 2. 构建阶段
- 运行 `npm run build:dist`
- 脚本自动复制文件到 `dist/` 目录
- 自动修正所有路径为绝对路径

### 3. 部署阶段
- 运行 `npm run deploy`
- 自动提交 `dist/` 目录到 Git
- 推送到 GitHub 触发 Cloudflare Pages 部署

## 📝 注意事项

### 文件同步
- 修改源码后必须运行构建脚本
- 不要直接编辑 `dist/` 目录下的文件
- 构建脚本会自动覆盖 `dist/` 目录

### 路径管理
- 所有部署文件必须使用绝对路径
- 构建脚本会自动修正相对路径
- 确保 Cloudflare Pages 配置指向 `dist` 目录

### 版本控制
- `dist/` 目录会被提交到 Git
- 源码文件正常提交
- 避免提交重复的部署目录

## 🔍 故障排除

### 文件缺失
```bash
# 检查构建脚本是否正常运行
npm run build:dist

# 检查 dist 目录内容
ls dist/
```

### 路径错误
```bash
# 检查 HTML 文件中的路径引用
grep -r "href=" dist/
grep -r "src=" dist/
```

### 部署失败
```bash
# 检查 Cloudflare Pages 配置
# 确保构建目录设置为 dist
# 确保构建命令正确
```

## 📚 相关命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run start        # 启动项目

# 构建
npm run build        # Webpack 构建
npm run build:dist   # 同步文件到 dist
npm run deploy       # 构建并部署

# 测试
npm run test         # 运行测试
``` 