# 月光云海博客系统

一个优雅的个人博客系统，采用前后端分离架构，具有现代化的UI设计和丰富的功能特性。

## 🌟 主要特性

- 🎨 优雅的月光主题设计
- 📱 完全响应式布局
- 🤖 内置AI助手对话功能
- ✨ 流畅的动画效果
- 🔒 安全的身份验证系统
- 📝 Markdown编辑器支持
- 📊 数据统计和分析
- 🏷️ 文章分类和标签管理
- 📁 文件上传和管理系统
- 🌐 多语言支持

## 🛠️ 技术栈

### 前端
- HTML5 / CSS3
- JavaScript (ES6+)
- Tailwind CSS - 样式框架
- Alpine.js - 轻量级JavaScript框架
- Marked.js - Markdown渲染
- Chart.js - 数据可视化

### 后端
- PHP 8.0+
- MySQL 8.0+
- Redis - 缓存系统
- JWT - 身份认证

### 开发工具
- Git - 版本控制
- Composer - PHP包管理器
- npm - Node.js包管理器
- Webpack - 资源打包工具
- Wrangler - Cloudflare Pages部署工具

## 📂 项目结构

```
moonlight-blog/
├── admin/                 # 管理后台
│   ├── api/               # 后端API接口
│   ├── includes/          # PHP类库
│   ├── assets/            # 后台资源文件
│   └── views/             # 后台页面
├── assets/                # 静态资源
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   ├── fonts/             # 字体文件
│   └── images/            # 图片资源
├── config/                # 配置文件
├── src/                   # 源代码
│   ├── components/        # 组件
│   └── utils/             # 工具函数
└── public/                # 公共文件
```

## ✅ 已完成功能

### 管理后台
- [x] 登录系统
  - [x] 安全认证
  - [x] 记住登录状态
  - [x] 登录限制
- [x] 仪表盘
  - [x] 数据概览
  - [x] 访问统计
- [x] AI助手集成
  - [x] 实时对话
  - [x] 上下文记忆
  - [x] 代码高亮

### 前端界面
- [x] 响应式布局
- [x] 月光主题
- [x] 动画效果
- [x] 暗黑模式

## 🚀 开发中功能

### 内容管理
- [ ] 文章管理
  - [ ] 创建/编辑文章
  - [ ] Markdown编辑器
  - [ ] 草稿保存
- [ ] 分类管理
- [ ] 标签系统
- [ ] 评论系统

### 系统功能
- [ ] 用户管理
  - [ ] 角色权限
  - [ ] 用户资料
- [ ] 文件管理
  - [ ] 图片上传
  - [ ] 文件组织
- [ ] 系统设置
  - [ ] 站点配置
  - [ ] 邮件设置
  - [ ] 缓存管理

### 性能优化
- [ ] 资源压缩
- [ ] 图片懒加载
- [ ] 页面缓存
- [ ] CDN加速

## 🔧 快速开始

1. 克隆仓库
```bash
git clone https://github.com/LKM-lkm/moonlight-blog.git
```

2. 安装依赖
```bash
# 安装Node.js依赖
npm install
```

3. 配置环境
- 复制`.env.example`为`.env`
- 配置数据库连接信息
- 配置AI API密钥（可选）

4. 启动开发服务器
```bash
npm run dev
```

## 📦 部署

### Cloudflare Pages 部署

1. 修正 `wrangler.toml` 配置:
```toml
name = "moonlight-blog"
compatibility_date = "2024-01-01"

# Pages配置
[build]
command = "npm run build"
pages_build_output_dir = "."
```

2. 确保 `package.json` 中的构建脚本正确：
```json
{
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development"
  }
}
```

3. 解决构建错误：
   - 修复 `admin.js` 中的重复声明问题
   - 创建缺失的 `chatbot.js` 文件
   - 添加字体文件目录

## 🐛 当前构建错误

根据最新的构建日志，需要修复以下问题：

1. `admin.js` 中的函数重复声明：
   ```
   ERROR in ./admin/assets/js/admin.js 47:9
   Module parse failed: Identifier 'showMessage' has already been declared (47:9)
   ```
   - 需要检查并删除重复的 `showMessage` 函数声明

2. 缺失的 `chatbot.js` 文件：
   ```
   ERROR in ./src/index.js 10:0-33
   Module not found: Error: Can't resolve '../assets/js/chatbot.js' in '/opt/buildhome/repo/src'
   ```
   - 需要创建 `assets/js/chatbot.js` 文件

3. 缺失的字体文件目录：
   ```
   ERROR in unable to locate '/opt/buildhome/repo/assets/fonts' glob
   ```
   - 需要创建 `assets/fonts` 目录并添加必要的字体文件

## 📝 待办事项

1. 优先修复构建错误：
   - [x] 更新 `wrangler.toml` 配置
   - [ ] 修复 `admin.js` 中的函数重复声明
   - [ ] 创建 `chatbot.js` 文件
   - [ ] 添加字体文件目录

2. 完成核心功能：
   - [ ] 文章管理系统
   - [ ] 用户权限管理
   - [ ] 文件上传功能
   - [ ] 评论系统

3. 优化性能：
   - [ ] 实现资源压缩
   - [ ] 添加图片懒加载
   - [ ] 配置页面缓存

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📮 联系方式

- 项目问题请提交 [Issue](https://github.com/LKM-lkm/moonlight-blog/issues)
- 商业合作请发送邮件至 [email protected]

# 功能总览

## 已实现功能

- 博客首页：
  - 响应式布局，月光主题，暗黑模式
  - 文章列表自动渲染（支持Markdown frontmatter）
  - 文章详情页，支持Markdown、图片、代码块、LaTeX公式
  - 文章封面、摘要、日期展示
  - 文章卡片点击跳转详情
  - 首页社交链接、个人信息展示
  - 主题切换器
  - 动画与玻璃拟态风格
- 聊天机器人：
  - AI助手对话，支持上下文记忆
  - 支持代码高亮、预设问题、打字机动画
- 后台管理：
  - 登录/登出，安全认证，登录限制
  - 仪表盘数据概览
  - 用户管理、角色权限（基础）
  - 文章管理API（基础）
  - 评论管理API（基础）
- 文章系统：
  - 支持Markdown格式，frontmatter元数据
  - 支持图片、文件、LaTeX、摘要、封面
- 其他：
  - 多语言支持（基础）
  - 文件上传API（基础）
  - Cloudflare Pages/Workers部署支持

## 即将实现/开发中功能

- 文章功能完善：
  - 自动发现所有Markdown文章，支持分页、标签筛选、置顶、排序
  - 文章标签/分类系统
  - 文章草稿、编辑、删除、置顶
  - 文章评论前端展示与交互
- 评论系统：
  - 前端评论展示与提交
  - 评论审核、回复、点赞
- 用户系统：
  - 用户注册、资料编辑、头像
  - 角色权限细化
- 文件管理：
  - 图片/文件上传与管理前端界面
- 性能与体验：
  - 首页/文章分页
  - 资源懒加载、CDN加速
  - 站点配置、邮件通知
