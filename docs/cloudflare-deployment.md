# Cloudflare Pages 部署指南

## 简介

本文档提供在 Cloudflare Pages 上部署Moonlight博客的详细步骤。

## 准备工作

1. 拥有 Cloudflare 账号
2. 已将代码推送到 GitHub 仓库

## 部署步骤

### 1. 登录 Cloudflare

访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录您的账号。

### 2. 创建新项目

1. 在左侧导航栏中，点击 **Pages**
2. 点击 **创建项目** 按钮
3. 选择 **连接到 Git**
4. 授权 Cloudflare 访问您的 GitHub 账号
5. 选择 `moonlight-blog` 仓库

### 3. 配置构建设置

在配置页面中填写以下信息：

- **项目名称**: `moonlight-blog` (或您喜欢的名称)
- **生产分支**: `main`
- **构建设置**: 
  - **构建命令**: 留空
  - **构建输出目录**: 留空

这样 Cloudflare 会将整个仓库作为静态网站部署。

### 4. 环境变量（可选）

如果您的博客需要特定的环境变量，可以在此处添加。

### 5. 开始部署

点击 **保存并部署** 按钮开始部署过程。

## 访问您的网站

部署完成后，您将获得一个格式为 `项目名称.pages.dev` 的 URL，例如 `moonlight-blog.pages.dev`。

## 处理 API 请求

本项目在 `workers-site/index.js` 中已配置了基本的 API 请求处理，可以处理身份验证等基本功能。

## 自定义域名（可选）

如果您有自己的域名，可以按照以下步骤配置：

1. 在项目设置中，点击 **自定义域名**
2. 点击 **设置自定义域名** 按钮
3. 输入您的域名并按照提示完成验证过程

## 常见问题

### 部署失败

- 检查仓库权限是否正确
- 检查构建命令和输出目录配置

### API 请求问题

- 确认请求路径格式正确
- 检查浏览器控制台是否有错误信息

## 维护与更新

每当您推送更改到 GitHub 仓库的 `main` 分支时，Cloudflare Pages 会自动重新构建和部署您的网站。

## 使用Git Bash更新项目到云端

### 1. 安装Git Bash

如果您尚未安装Git Bash，请访问[Git官网](https://git-scm.com/downloads)下载并安装。

### 2. 配置Git（首次使用）

打开Git Bash，设置您的用户名和邮箱：

```bash
git config --global user.name "您的GitHub用户名"
git config --global user.email "您的邮箱地址"
```

### 3. 克隆仓库（首次使用）

如果您是首次在本地使用该仓库，需要先克隆：

```bash
# 进入您想要存放项目的目录
cd /e/用户/Desktop

# 克隆仓库
git clone https://github.com/LKM-lkm/moonlight-blog.git

# 进入项目目录
cd moonlight-blog
```

### 4. 更新本地代码

在推送更改前，先拉取最新的代码：

```bash
# 确保您在项目目录中
cd /e/用户/Desktop/moonlight-blog

# 拉取最新代码
git pull origin main
```

### 5. 添加更改

将您修改的文件添加到暂存区：

```bash
# 添加所有更改
git add .

# 或者添加特定文件
git add 文件路径
```

### 6. 提交更改

提交您的更改并添加描述性的提交信息：

```bash
git commit -m "更新内容：例如'添加登录页面验证码功能'"
```

### 7. 推送到GitHub

将您的更改推送到GitHub仓库：

```bash
git push origin main
```

### 8. 验证部署

推送完成后，Cloudflare Pages会自动检测到更改并开始部署。您可以在Cloudflare Dashboard中查看部署状态。

### 常见Git Bash问题解决

#### 身份验证问题

如果遇到身份验证问题，可以：

1. 使用个人访问令牌（推荐）：
   - 在GitHub上创建个人访问令牌（Settings > Developer settings > Personal access tokens）
   - 使用令牌作为密码进行身份验证

2. 或者配置SSH密钥：
   ```bash
   # 生成SSH密钥
   ssh-keygen -t ed25519 -C "您的邮箱地址"
   
   # 查看公钥并添加到GitHub
   cat ~/.ssh/id_ed25519.pub
   ```

#### 分支管理

如果您需要在不同分支上工作：

```bash
# 创建并切换到新分支
git checkout -b 分支名称

# 切换分支
git checkout 分支名称

# 合并分支
git merge 分支名称
```

#### 撤销更改

如果需要撤销更改：

```bash
# 撤销未暂存的更改
git checkout -- 文件路径

# 撤销已暂存的更改
git reset HEAD 文件路径

# 撤销最近的提交
git reset --soft HEAD~1
```

### 自动化部署流程

为了简化部署流程，您可以创建一个简单的脚本：

```bash
#!/bin/bash
# 保存为update.sh

# 进入项目目录
cd /e/用户/Desktop/moonlight-blog

# 拉取最新代码
git pull origin main

# 添加所有更改
git add .

# 提交更改
git commit -m "自动更新: $(date)"

# 推送到GitHub
git push origin main

echo "更新完成，Cloudflare正在部署..."
```

使用方法：

```bash
# 添加执行权限
chmod +x update.sh

# 运行脚本
./update.sh
``` 