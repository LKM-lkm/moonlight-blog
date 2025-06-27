// 文章详情页渲染脚本
// 依赖 marked.js

let currentArticleIndex = -1;
let articlesList = [];

// 阅读量统计
function updateReadCount(file) {
    const readCountKey = 'article_read_count';
    const readRecordsKey = 'article_read_records';
    
    // 获取阅读记录
    let readRecords = JSON.parse(localStorage.getItem(readRecordsKey) || '{}');
    let readCounts = JSON.parse(localStorage.getItem(readCountKey) || '{}');
    
    const now = Date.now();
    const lastRead = readRecords[file] || 0;
    
    // 如果距离上次阅读超过30分钟，则增加阅读量
    if (now - lastRead > 30 * 60 * 1000) {
        readCounts[file] = (readCounts[file] || 0) + 1;
        localStorage.setItem(readCountKey, JSON.stringify(readCounts));
    }
    
    // 更新阅读时间
    readRecords[file] = now;
    localStorage.setItem(readRecordsKey, JSON.stringify(readRecords));
    
    return readCounts[file] || 0;
}

// 获取阅读量
function getReadCount(file) {
    const readCountKey = 'article_read_count';
    const readCounts = JSON.parse(localStorage.getItem(readCountKey) || '{}');
    return readCounts[file] || 0;
}

// 格式化阅读量显示
function formatReadCount(count) {
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1) + 'k';
    return (count / 10000).toFixed(1) + 'w';
}

// 渲染阅读量
function renderReadCount(file) {
    const readCount = getReadCount(file);
    const readCountElement = document.getElementById('article-read-count');
    if (readCountElement) {
        readCountElement.innerHTML = `<i class="fas fa-eye"></i> ${formatReadCount(readCount)} 次阅读`;
    }
}

// 获取URL参数
function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

// 加载文章列表用于导航
async function loadArticlesList() {
    try {
        const res = await fetch('articles/index.json');
        if (res.ok) {
            articlesList = await res.json();
            const currentFile = getQueryParam('file');
            currentArticleIndex = articlesList.findIndex(article => article.file === currentFile);
        }
    } catch (e) {
        console.error('加载文章列表失败:', e);
    }
}

// 渲染导航
function renderNavigation() {
    const navContainer = document.getElementById('article-navigation');
    if (!navContainer || currentArticleIndex === -1) return;
    
    let navHtml = '<div class="article-navigation">';
    
    // 上一篇
    if (currentArticleIndex > 0) {
        const prevArticle = articlesList[currentArticleIndex - 1];
        navHtml += `
            <a href="article.html?file=${encodeURIComponent(prevArticle.file)}" class="nav-link prev-link">
                <i class="fas fa-chevron-left"></i>
                <div class="nav-content">
                    <span class="nav-label">上一篇</span>
                    <span class="nav-title">${prevArticle.title}</span>
                </div>
            </a>
        `;
    } else {
        navHtml += '<div class="nav-link prev-link disabled"><i class="fas fa-chevron-left"></i><span>已是第一篇</span></div>';
    }
    
    // 下一篇
    if (currentArticleIndex < articlesList.length - 1) {
        const nextArticle = articlesList[currentArticleIndex + 1];
        navHtml += `
            <a href="article.html?file=${encodeURIComponent(nextArticle.file)}" class="nav-link next-link">
                <div class="nav-content">
                    <span class="nav-label">下一篇</span>
                    <span class="nav-title">${nextArticle.title}</span>
                </div>
                <i class="fas fa-chevron-right"></i>
            </a>
        `;
    } else {
        navHtml += '<div class="nav-link next-link disabled"><span>已是最后一篇</span><i class="fas fa-chevron-right"></i></div>';
    }
    
    navHtml += '</div>';
    navContainer.innerHTML = navHtml;
}

// 拉取并渲染Markdown
async function renderArticle() {
    const file = getQueryParam('file');
    if (!file) {
        document.getElementById('article-container').innerHTML = '<p>未指定文章文件。</p>';
        return;
    }
    
    // 先加载文章列表
    await loadArticlesList();
    
    try {
        const res = await fetch(`/articles/${file}`);
        if (!res.ok) throw new Error('文章加载失败');
        const md = await res.text();
        // 解析frontmatter
        const match = md.match(/^---([\s\S]*?)---/);
        let meta = {}, content = md;
        if (match) {
            const fm = match[1].trim();
            content = md.slice(match[0].length).trim();
            fm.split('\n').forEach(line => {
                const [k, ...v] = line.split(':');
                meta[k.trim()] = v.join(':').trim().replace(/^"|"$/g, '');
            });
        }
        // 渲染元数据
        let metaHtml = '';
        if (meta.cover) metaHtml += `<img class='article-cover' src='${meta.cover}' alt='封面'>`;
        if (meta.title) metaHtml += `<h1 class='article-title'>${meta.title}</h1>`;
        metaHtml += `<div class='article-meta-info'>`;
        if (meta.author) metaHtml += `<span class='article-author'><i class='fas fa-user'></i> ${meta.author}</span>`;
        if (meta.date) metaHtml += `<span class='article-date'><i class='fas fa-calendar-alt'></i> ${meta.date}</span>`;
        if (meta.tags) {
            const tags = meta.tags.split(',').map(t => t.trim()).filter(Boolean);
            if (tags.length > 0) {
                metaHtml += `<span class='article-tags'>` + tags.map(tag => `<span class='tag tag-link' data-tag='${tag}'>${tag}</span>`).join('') + `</span>`;
            }
        }
        metaHtml += `</div>`;
        if (meta.excerpt) metaHtml += `<div class='article-excerpt'>${meta.excerpt}</div>`;
        document.getElementById('article-meta').innerHTML = metaHtml;
        // 渲染正文
        let html = `<div class='article-content'>${marked.parse(content)}</div>`;
        document.getElementById('article-container').innerHTML = html;
        // 渲染LaTeX公式
        if (window.renderMathInElement) {
            window.renderMathInElement(document.getElementById('article-container'), {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
        }
        // 标签点击跳转首页并筛选
        document.querySelectorAll('.tag-link').forEach(tagEl => {
            tagEl.onclick = function() {
                window.location.href = `index.html?tag=${encodeURIComponent(this.dataset.tag)}`;
            };
        });
        
        // 渲染导航
        renderNavigation();
        // 渲染阅读量
        renderReadCount(file);
    } catch (e) {
        document.getElementById('article-container').innerHTML = `<p>加载失败：${e.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', renderArticle); 