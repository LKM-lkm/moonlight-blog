# 月光云海博客 - API文档

## 📋 API概述

月光云海博客提供RESTful API接口，支持文章管理、用户认证、文件上传等功能。

## 🔐 认证

### JWT Token认证
```http
Authorization: Bearer <your_jwt_token>
```

### 获取Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

## 📝 文章管理API

### 获取文章列表
```http
GET /api/articles
```

**查询参数:**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `category`: 分类筛选
- `tag`: 标签筛选
- `search`: 搜索关键词

**响应示例:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": 1,
        "title": "文章标题",
        "content": "文章内容...",
        "excerpt": "文章摘要...",
        "author": "作者名",
        "category": "技术",
        "tags": ["JavaScript", "Web"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "status": "published"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### 获取单篇文章
```http
GET /api/articles/{id}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "文章标题",
    "content": "完整的文章内容...",
    "excerpt": "文章摘要...",
    "author": "作者名",
    "category": "技术",
    "tags": ["JavaScript", "Web"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "status": "published",
    "read_count": 100,
    "like_count": 10
  }
}
```

### 创建文章
```http
POST /api/articles
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "新文章标题",
  "content": "文章内容...",
  "excerpt": "文章摘要...",
  "category": "技术",
  "tags": ["JavaScript", "Web"],
  "status": "draft"
}
```

### 更新文章
```http
PUT /api/articles/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "更新后的标题",
  "content": "更新后的内容...",
  "excerpt": "更新后的摘要...",
  "category": "技术",
  "tags": ["JavaScript", "Web"],
  "status": "published"
}
```

### 删除文章
```http
DELETE /api/articles/{id}
Authorization: Bearer <token>
```

## 👥 用户管理API

### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "username",
  "password": "password"
}
```

### 获取用户信息
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### 更新用户信息
```http
PUT /api/users/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "display_name": "显示名称",
  "email": "newemail@example.com",
  "bio": "个人简介"
}
```

## 📁 文件管理API

### 上传文件
```http
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <file_data>
type: "image"
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/uploads/image.jpg",
    "filename": "image.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

### 获取文件列表
```http
GET /api/files
Authorization: Bearer <token>
```

### 删除文件
```http
DELETE /api/files/{id}
Authorization: Bearer <token>
```

## 🏷️ 分类和标签API

### 获取分类列表
```http
GET /api/categories
```

### 创建分类
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "技术",
  "description": "技术相关文章"
}
```

### 获取标签列表
```http
GET /api/tags
```

### 创建标签
```http
POST /api/tags
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "JavaScript",
  "color": "#f7df1e"
}
```

## 💬 评论API

### 获取文章评论
```http
GET /api/articles/{id}/comments
```

### 发表评论
```http
POST /api/articles/{id}/comments
Content-Type: application/json

{
  "content": "评论内容",
  "parent_id": null
}
```

### 回复评论
```http
POST /api/articles/{id}/comments
Content-Type: application/json

{
  "content": "回复内容",
  "parent_id": 1
}
```

## 🔍 搜索API

### 全文搜索
```http
GET /api/search
```

**查询参数:**
- `q`: 搜索关键词
- `type`: 搜索类型 (articles, users, tags)
- `page`: 页码
- `limit`: 每页数量

**响应示例:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "article",
        "id": 1,
        "title": "文章标题",
        "excerpt": "包含关键词的文章摘要...",
        "highlight": "包含<span class='highlight'>关键词</span>的内容"
      }
    ],
    "total": 50,
    "query": "关键词"
  }
}
```

## 📊 统计API

### 获取网站统计
```http
GET /api/stats
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "articles": {
      "total": 100,
      "published": 80,
      "draft": 20
    },
    "users": {
      "total": 50,
      "active": 30
    },
    "comments": {
      "total": 200,
      "pending": 5
    },
    "views": {
      "today": 1000,
      "week": 5000,
      "month": 20000
    }
  }
}
```

## 🔧 系统API

### 获取系统信息
```http
GET /api/system/info
```

### 获取系统配置
```http
GET /api/system/config
```

### 更新系统配置
```http
PUT /api/system/config
Content-Type: application/json
Authorization: Bearer <token>

{
  "site_name": "月光云海博客",
  "site_description": "个人博客系统",
  "theme": "light"
}
```

## 📝 错误处理

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": {
      "field": "title",
      "message": "标题不能为空"
    }
  }
}
```

### 常见错误代码
- `AUTHENTICATION_ERROR`: 认证失败
- `AUTHORIZATION_ERROR`: 权限不足
- `VALIDATION_ERROR`: 数据验证失败
- `NOT_FOUND`: 资源不存在
- `INTERNAL_ERROR`: 服务器内部错误

## 🔒 安全说明

### 请求限制
- 认证请求: 100次/小时
- 文件上传: 10MB/文件
- API请求: 1000次/小时

### 数据验证
- 所有输入数据都会进行验证
- 文件类型和大小限制
- SQL注入防护
- XSS攻击防护

## 📚 SDK和工具

### JavaScript SDK
```javascript
import { MoonlightAPI } from '@moonlight-blog/sdk';

const api = new MoonlightAPI({
  baseURL: 'https://api.example.com',
  token: 'your_token'
});

// 获取文章列表
const articles = await api.articles.list({
  page: 1,
  limit: 10
});

// 创建文章
const article = await api.articles.create({
  title: '新文章',
  content: '内容...'
});
```

### cURL示例
```bash
# 获取文章列表
curl -X GET "https://api.example.com/api/articles" \
  -H "Authorization: Bearer your_token"

# 创建文章
curl -X POST "https://api.example.com/api/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "title": "新文章",
    "content": "内容..."
  }'
```

## 🔄 Webhook

### 配置Webhook
```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://your-app.com/webhook",
  "events": ["article.created", "article.updated"],
  "secret": "webhook_secret"
}
```

### Webhook事件
- `article.created`: 文章创建
- `article.updated`: 文章更新
- `article.deleted`: 文章删除
- `comment.created`: 评论创建
- `user.registered`: 用户注册

---

**API版本**: v1.0
**最后更新**: 2024年1月
**维护者**: AI助手 