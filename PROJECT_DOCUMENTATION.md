# 月光云海博客系统 - 项目文档

## 📋 项目概述

月光云海博客是一个基于现代Web技术构建的个人博客系统，采用前后端分离架构，具有优雅的月光主题设计和丰富的功能特性。

### 🎯 项目目标

- 构建一个美观、功能丰富的个人博客系统
- 实现从文件夹读取文件的模块化架构
- 提供完整的后台管理功能
- 支持多设备响应式设计
- 集成AI聊天机器人功能
- 实现玻璃拟态UI设计风格

## 🏗️ 技术架构

### 前端技术栈
- **HTML5/CSS3**: 现代Web标准
- **JavaScript (ES6+)**: 核心编程语言
- **Webpack**: 模块打包工具
- **Tailwind CSS**: 实用优先的CSS框架
- **Alpine.js**: 轻量级JavaScript框架
- **Marked.js**: Markdown渲染引擎
- **Chart.js**: 数据可视化库

### 后端技术栈
- **Cloudflare Workers**: 边缘计算平台
- **PHP**: 服务器端脚本语言
- **MySQL**: 关系型数据库
- **Redis**: 缓存系统
- **JWT**: 身份认证

### 开发工具
- **Git**: 版本控制系统
- **npm**: Node.js包管理器
- **Wrangler**: Cloudflare部署工具
- **Jest**: 单元测试框架

## 📂 项目结构

```
moonlight-blog/
├── 📁 admin/                    # 后台管理系统
│   ├── 📁 api/                  # API接口
│   ├── 📁 assets/               # 后台资源文件
│   ├── 📁 views/                # 后台页面模板
│   ├── 📁 includes/             # PHP类库
│   └── 📁 dashboard/            # 仪表盘页面
├── 📁 assets/                   # 静态资源
│   ├── 📁 css/                  # 样式文件
│   ├── 📁 js/                   # JavaScript文件
│   ├── 📁 images/               # 图片资源
│   └── 📁 fonts/                # 字体文件
├── 📁 src/                      # 源代码
│   ├── index.js                 # 主入口文件
│   └── worker.js                # Cloudflare Worker
├── 📁 data/                     # 数据存储
│   ├── profile.json             # 博主信息
│   ├── 📁 articles/             # 文章数据
│   └── 📁 chatbot/              # 聊天记录
├── 📁 server/                   # 服务器端脚本
├── 📁 config/                   # 配置文件
├── 📁 scripts/                  # 构建脚本
└── 📁 dist/                     # 构建输出目录
```

## 🚀 核心功能

### ✅ 已实现功能

#### 1. 前端界面
- **响应式设计**: 完美适配桌面、平板、手机
- **月光主题**: 优雅的玻璃拟态设计风格
- **暗黑模式**: 支持深浅主题切换
- **动画效果**: 流畅的非线性动画
- **文章展示**: Markdown渲染，支持代码高亮
- **聊天机器人**: AI助手对话功能

#### 2. 后台管理
- **用户认证**: 安全的登录系统
- **仪表盘**: 数据统计和概览
- **文章管理**: 创建、编辑、删除文章
- **用户管理**: 用户权限和角色管理
- **系统设置**: 站点配置和邮件设置

#### 3. 内容系统
- **Markdown支持**: 完整的Markdown语法支持
- **图片管理**: 图片上传和展示
- **文件下载**: 支持各种文件类型下载
- **LaTeX公式**: 数学公式渲染
- **代码高亮**: 语法高亮显示

### 🔄 开发中功能

#### 1. 内容管理
- [ ] 文章分类和标签系统
- [ ] 草稿保存功能
- [ ] 文章版本控制
- [ ] 批量操作功能

#### 2. 用户系统
- [ ] 用户注册功能
- [ ] 用户资料编辑
- [ ] 头像上传功能
- [ ] 角色权限细化

#### 3. 交互功能
- [ ] 评论系统
- [ ] 点赞功能
- [ ] 分享功能
- [ ] 搜索功能

## 🛠️ 开发环境搭建

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- PHP >= 8.0
- MySQL >= 8.0

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/LKM-lkm/moonlight-blog.git
cd moonlight-blog
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

4. **启动开发服务器**
```bash
npm run dev
```

## 📦 构建和部署

### 本地构建
```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 构建并部署
npm run deploy
```

### Cloudflare Pages 部署

1. **配置 wrangler.toml**
```toml
name = "moonlight-blog"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
pages_build_output_dir = "dist"
```

2. **部署命令**
```bash
wrangler pages deploy dist
```

## 🐛 已知问题和解决方案

### 1. 构建错误修复

#### 问题：admin.js 中函数重复声明
**错误信息**: `Identifier 'showMessage' has already been declared`

**解决方案**: 
- 已修复 `admin/assets/js/admin.js` 中的重复声明
- 保留 `adminUtils.showMessage` 定义
- 修改 `adminApp.showMessage` 为调用 `adminUtils.showMessage`

#### 问题：缺失的 chatbot.js 文件
**错误信息**: `Can't resolve '../assets/js/chatbot.js'`

**解决方案**: 
- 确认 `assets/js/chatbot.js` 文件存在
- 检查文件路径和导入语句

#### 问题：字体文件目录缺失
**错误信息**: `unable to locate '/opt/buildhome/repo/assets/fonts' glob`

**解决方案**: 
- 已创建 `assets/fonts` 目录
- 更新字体配置使用系统字体栈
- 添加字体文件说明文档

### 2. Webpack 配置优化

#### 修复内容：
- 添加 admin.js 作为独立入口
- 修复文件复制配置
- 优化构建输出结构

### 3. 性能优化建议

#### 前端优化：
- [ ] 实现图片懒加载
- [ ] 添加资源压缩
- [ ] 配置CDN加速
- [ ] 实现页面缓存

#### 后端优化：
- [ ] 数据库查询优化
- [ ] Redis缓存配置
- [ ] API响应压缩
- [ ] 静态资源缓存

## 📊 项目状态

### 完成度统计
- **前端界面**: 85% ✅
- **后台管理**: 70% ✅
- **内容系统**: 60% 🔄
- **用户系统**: 40% 🔄
- **性能优化**: 30% 🔄

### 近期计划
1. **优先级1**: 修复所有构建错误
2. **优先级2**: 完善文章管理系统
3. **优先级3**: 实现评论功能
4. **优先级4**: 优化性能和用户体验

## 🤝 贡献指南

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 Prettier 代码格式化
- 编写单元测试
- 添加适当的注释

## 📞 技术支持

### 问题反馈
- 提交 Issue: [GitHub Issues](https://github.com/LKM-lkm/moonlight-blog/issues)
- 邮件联系: [email protected]

### 文档资源
- [项目 Wiki](https://github.com/LKM-lkm/moonlight-blog/wiki)
- [API 文档](docs/api.md)
- [部署指南](docs/deployment.md)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**最后更新**: 2024年1月
**版本**: 1.0.0
**维护者**: LKM-lkm 