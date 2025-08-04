# 月光云海博客 - 部署指南

## 🚀 部署概述

本指南将帮助您将月光云海博客部署到各种平台，包括Cloudflare Pages、Vercel、Netlify等。

## 📋 环境要求

### 系统要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- Git >= 2.0.0

### 浏览器支持
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 🔧 本地开发环境

### 1. 克隆项目
```bash
git clone https://github.com/LKM-lkm/moonlight-blog.git
cd moonlight-blog
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

### 4. 启动开发服务器
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## ☁️ Cloudflare Pages 部署

### 1. 准备工作
1. 注册 [Cloudflare](https://cloudflare.com) 账户
2. 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
3. 登录 Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 2. 配置项目
```bash
# 初始化 Wrangler 配置
wrangler init

# 编辑 wrangler.toml
nano wrangler.toml
```

### 3. 部署配置
```toml
# wrangler.toml
name = "moonlight-blog"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
pages_build_output_dir = "dist"

[env.production]
name = "moonlight-blog-prod"

[env.staging]
name = "moonlight-blog-staging"
```

### 4. 部署命令
```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist

# 或使用 GitHub Actions 自动部署
git push origin main
```

### 5. 自定义域名
1. 在 Cloudflare Dashboard 中添加自定义域名
2. 配置 DNS 记录
3. 启用 HTTPS

## 🚀 Vercel 部署

### 1. 准备工作
1. 注册 [Vercel](https://vercel.com) 账户
2. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2. 项目配置
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 3. 部署命令
```bash
# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产部署
vercel --prod
```

## 🌐 Netlify 部署

### 1. 准备工作
1. 注册 [Netlify](https://netlify.com) 账户
2. 安装 Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. 项目配置
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. 部署命令
```bash
# 登录 Netlify
netlify login

# 初始化项目
netlify init

# 部署项目
netlify deploy --prod
```

## 🔒 环境变量配置

### 必需环境变量
```bash
# 数据库配置
DATABASE_URL=your_database_url
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password

# API密钥
API_KEY=your_api_key
JWT_SECRET=your_jwt_secret

# 第三方服务
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 可选环境变量
```bash
# 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# 文件存储
STORAGE_TYPE=local
STORAGE_PATH=./uploads
```

## 📊 性能优化

### 1. 构建优化
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
}
```

### 2. 缓存策略
```javascript
// 静态资源缓存
app.use('/assets', express.static('dist/assets', {
  maxAge: '1y',
  immutable: true
}));

// API缓存
app.use('/api', cache('5 minutes'));
```

### 3. CDN配置
```javascript
// 配置CDN域名
const CDN_URL = process.env.CDN_URL || 'https://cdn.example.com';

// 资源URL生成
function getAssetUrl(path) {
  return `${CDN_URL}/assets/${path}`;
}
```

## 🔍 监控和日志

### 1. 错误监控
```javascript
// 集成错误监控服务
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### 2. 性能监控
```javascript
// 性能指标收集
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. 访问日志
```javascript
// 访问日志记录
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

## 🔧 维护和更新

### 1. 定期更新
```bash
# 更新依赖
npm update

# 检查安全漏洞
npm audit

# 修复安全漏洞
npm audit fix
```

### 2. 备份策略
```bash
# 数据库备份
mysqldump -u username -p database_name > backup.sql

# 文件备份
tar -czf uploads_backup.tar.gz uploads/

# 代码备份
git push origin main
```

### 3. 回滚策略
```bash
# 代码回滚
git revert HEAD

# 数据库回滚
mysql -u username -p database_name < backup.sql

# 文件回滚
tar -xzf uploads_backup.tar.gz
```

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清理缓存
npm run clean
rm -rf node_modules
npm install

# 检查Node.js版本
node --version
```

#### 2. 部署失败
```bash
# 检查构建输出
npm run build
ls -la dist/

# 检查环境变量
echo $NODE_ENV
```

#### 3. 性能问题
```bash
# 分析包大小
npm run analyze

# 检查加载时间
npm run lighthouse
```

### 调试工具
```bash
# 开发模式调试
npm run dev -- --inspect

# 生产模式调试
NODE_ENV=production npm run build
```

## 📞 技术支持

### 获取帮助
- **GitHub Issues**: [项目问题反馈](https://github.com/LKM-lkm/moonlight-blog/issues)
- **文档**: [项目文档](https://github.com/LKM-lkm/moonlight-blog/docs)
- **邮件**: [技术支持](mailto:support@example.com)

### 社区资源
- **Discord**: [开发者社区](https://discord.gg/example)
- **Stack Overflow**: [技术问答](https://stackoverflow.com/questions/tagged/moonlight-blog)
- **Reddit**: [用户讨论](https://reddit.com/r/moonlightblog)

---

**最后更新**: 2024年1月
**维护者**: AI助手 