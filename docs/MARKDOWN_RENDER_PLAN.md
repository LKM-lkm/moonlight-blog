# Markdown渲染功能规划

## 🎯 功能概述

实现完整的Markdown渲染系统，支持博客文章的创建、编辑、预览和发布，提供丰富的Markdown语法支持和扩展功能。

## 📋 功能需求

### 1. 核心功能
- [ ] **Markdown解析**: 支持标准Markdown语法
- [ ] **实时预览**: 编辑时实时显示渲染结果
- [ ] **语法高亮**: 代码块语法高亮
- [ ] **数学公式**: LaTeX数学公式渲染
- [ ] **图片支持**: 图片上传和显示
- [ ] **文件下载**: 支持各种文件类型下载

### 2. 扩展功能
- [ ] **Front Matter**: YAML前置元数据支持
- [ ] **自定义组件**: 特殊组件渲染
- [ ] **目录生成**: 自动生成文章目录
- [ ] **搜索高亮**: 搜索结果关键词高亮
- [ ] **导出功能**: 支持PDF、HTML导出

## 🏗️ 技术架构

### 1. 前端技术栈
```javascript
// Markdown解析和渲染
import { marked } from 'marked';
import { highlight } from 'highlight.js';
import katex from 'katex';

// 编辑器组件
import { Editor } from '@monaco-editor/react';
import { Preview } from 'react-markdown';
```

### 2. 后端支持
```javascript
// 文件处理
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Markdown处理
import matter from 'gray-matter';
import { remark } from 'remark';
import { html } from 'remark-html';
```

## 📁 文件结构

```
src/
├── components/
│   ├── MarkdownEditor/           # Markdown编辑器组件
│   │   ├── Editor.js
│   │   ├── Preview.js
│   │   └── Toolbar.js
│   ├── MarkdownRenderer/         # Markdown渲染组件
│   │   ├── Renderer.js
│   │   ├── CodeBlock.js
│   │   └── MathRenderer.js
│   └── ArticleViewer/            # 文章查看组件
│       ├── Viewer.js
│       ├── TableOfContents.js
│       └── ArticleMeta.js
├── utils/
│   ├── markdown.js               # Markdown处理工具
│   ├── frontMatter.js            # Front Matter处理
│   └── fileUpload.js             # 文件上传工具
└── styles/
    ├── markdown.css              # Markdown样式
    ├── code-highlight.css        # 代码高亮样式
    └── math.css                  # 数学公式样式
```

## 🔧 实现方案

### 1. Markdown编辑器组件

```javascript
// components/MarkdownEditor/Editor.js
import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { marked } from 'marked';

const MarkdownEditor = ({ value, onChange, theme = 'vs-dark' }) => {
    const [content, setContent] = useState(value || '');
    
    const handleChange = (newValue) => {
        setContent(newValue);
        onChange?.(newValue);
    };
    
    return (
        <div className="markdown-editor">
            <Editor
                height="600px"
                defaultLanguage="markdown"
                value={content}
                onChange={handleChange}
                theme={theme}
                options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    fontSize: 14,
                    fontFamily: 'Fira Code, Consolas, monospace'
                }}
            />
        </div>
    );
};

export default MarkdownEditor;
```

### 2. Markdown渲染组件

```javascript
// components/MarkdownRenderer/Renderer.js
import React from 'react';
import { marked } from 'marked';
import { highlight } from 'highlight.js';
import katex from 'katex';

const MarkdownRenderer = ({ content, className = '' }) => {
    // 配置marked选项
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && highlight.getLanguage(lang)) {
                try {
                    return highlight.highlight(code, { language: lang }).value;
                } catch (err) {}
            }
            return code;
        },
        breaks: true,
        gfm: true
    });
    
    // 自定义渲染器
    const renderer = new marked.Renderer();
    
    // 数学公式渲染
    renderer.code = function(code, language) {
        if (language === 'math' || language === 'latex') {
            try {
                return katex.renderToString(code, {
                    displayMode: true,
                    throwOnError: false
                });
            } catch (e) {
                return `<pre><code class="math-error">${code}</code></pre>`;
            }
        }
        return `<pre><code class="hljs ${language}">${code}</code></pre>`;
    };
    
    // 行内数学公式
    renderer.text = function(text) {
        return text.replace(/\$([^\$]+)\$/g, (match, formula) => {
            try {
                return katex.renderToString(formula, {
                    displayMode: false,
                    throwOnError: false
                });
            } catch (e) {
                return match;
            }
        });
    };
    
    marked.use({ renderer });
    
    const htmlContent = marked(content);
    
    return (
        <div 
            className={`markdown-content ${className}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};

export default MarkdownRenderer;
```

### 3. Front Matter处理

```javascript
// utils/frontMatter.js
import matter from 'gray-matter';

export const parseFrontMatter = (content) => {
    const { data, content: markdownContent } = matter(content);
    return {
        frontMatter: data,
        content: markdownContent
    };
};

export const createArticle = (frontMatter, content) => {
    return matter.stringify(content, frontMatter);
};

export const validateFrontMatter = (frontMatter) => {
    const required = ['title', 'date'];
    const missing = required.filter(field => !frontMatter[field]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
};
```

### 4. 文件上传处理

```javascript
// utils/fileUpload.js
export const uploadFile = async (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        return result.url;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

export const insertImage = (url, alt = '', title = '') => {
    return `![${alt}](${url}${title ? ` "${title}"` : ''})`;
};

export const insertFile = (url, filename, description = '') => {
    return `[${filename}](${url})${description ? ` - ${description}` : ''}`;
};
```

## 🎨 样式设计

### 1. Markdown基础样式

```css
/* styles/markdown.css */
.markdown-content {
    line-height: 1.6;
    color: var(--text-primary);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
    margin-top: 2em;
    margin-bottom: 1em;
    font-weight: 600;
    color: var(--text-primary);
}

.markdown-content h1 {
    font-size: 2.2rem;
    border-bottom: 2px solid var(--accent-color);
    padding-bottom: 0.5em;
}

.markdown-content h2 {
    font-size: 1.8rem;
    border-bottom: 1px solid var(--glass-border);
    padding-bottom: 0.3em;
}

.markdown-content p {
    margin-bottom: 1em;
}

.markdown-content blockquote {
    border-left: 4px solid var(--accent-color);
    padding-left: 1em;
    margin: 1em 0;
    background: var(--glass-bg);
    border-radius: 0 8px 8px 0;
}

.markdown-content code {
    background: var(--input-bg);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
}

.markdown-content pre {
    background: var(--card-bg);
    padding: 1em;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1em 0;
}

.markdown-content pre code {
    background: none;
    padding: 0;
}

.markdown-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
}

.markdown-content th,
.markdown-content td {
    border: 1px solid var(--glass-border);
    padding: 0.5em;
    text-align: left;
}

.markdown-content th {
    background: var(--glass-bg);
    font-weight: 600;
}
```

### 2. 代码高亮样式

```css
/* styles/code-highlight.css */
.hljs {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1em;
    border-radius: 6px;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9em;
    line-height: 1.4;
}

.hljs-keyword {
    color: #569cd6;
}

.hljs-string {
    color: #ce9178;
}

.hljs-comment {
    color: #6a9955;
}

.hljs-function {
    color: #dcdcaa;
}

.hljs-number {
    color: #b5cea8;
}
```

### 3. 数学公式样式

```css
/* styles/math.css */
.katex {
    font-size: 1.1em;
}

.katex-display {
    margin: 1em 0;
    text-align: center;
}

.math-error {
    color: #e57373;
    background: #ffebee;
    padding: 0.5em;
    border-radius: 4px;
    border: 1px solid #ef5350;
}
```

## 📝 使用示例

### 1. 编辑器使用

```javascript
// 在后台管理页面中使用
import MarkdownEditor from '../components/MarkdownEditor/Editor';

const ArticleEditor = () => {
    const [content, setContent] = useState('');
    
    return (
        <div className="article-editor">
            <MarkdownEditor
                value={content}
                onChange={setContent}
                theme="vs-dark"
            />
        </div>
    );
};
```

### 2. 渲染器使用

```javascript
// 在文章页面中使用
import MarkdownRenderer from '../components/MarkdownRenderer/Renderer';

const ArticleViewer = ({ article }) => {
    return (
        <article className="article-content">
            <MarkdownRenderer content={article.content} />
        </article>
    );
};
```

## 🚀 开发计划

### 第一阶段：基础功能 (1-2周)
1. **Markdown解析器集成**
   - 集成marked.js
   - 配置基础语法支持
   - 实现基础渲染

2. **编辑器组件**
   - 创建Monaco编辑器组件
   - 实现实时预览
   - 添加工具栏

3. **样式系统**
   - 设计Markdown样式
   - 实现代码高亮
   - 添加响应式支持

### 第二阶段：扩展功能 (2-3周)
1. **数学公式支持**
   - 集成KaTeX
   - 支持行内和块级公式
   - 错误处理

2. **Front Matter处理**
   - 集成gray-matter
   - 元数据验证
   - 自动生成功能

3. **文件上传**
   - 图片上传功能
   - 文件管理
   - 拖拽支持

### 第三阶段：高级功能 (1-2周)
1. **自定义组件**
   - 特殊组件渲染
   - 插件系统
   - 扩展API

2. **导出功能**
   - PDF导出
   - HTML导出
   - 批量处理

3. **性能优化**
   - 懒加载
   - 缓存机制
   - 代码分割

## 📊 测试计划

### 1. 单元测试
- Markdown解析器测试
- 组件渲染测试
- 工具函数测试

### 2. 集成测试
- 编辑器功能测试
- 文件上传测试
- 样式渲染测试

### 3. 性能测试
- 大文档渲染性能
- 内存使用测试
- 加载速度测试

## 🎯 成功标准

### 功能完整性
- [ ] 支持所有标准Markdown语法
- [ ] 实时预览功能正常
- [ ] 数学公式正确渲染
- [ ] 代码高亮正常工作

### 用户体验
- [ ] 编辑器响应流畅
- [ ] 预览同步准确
- [ ] 样式美观一致
- [ ] 操作简单直观

### 性能指标
- [ ] 大文档渲染时间 < 2秒
- [ ] 内存使用 < 100MB
- [ ] 首次加载时间 < 3秒

---

**规划完成时间**: 2024年1月
**预计开发时间**: 4-7周
**优先级**: 高 