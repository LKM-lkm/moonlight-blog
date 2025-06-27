// 主要功能处理脚本

// 博客文章页面大小和当前页码
var pageSize = 6;
var currentPage = 1;
var totalPages = 1;
var allArticles = [];
var currentTag = null;

// 文章数据
var articles = [
    {
        title: 'Moonlight助手',
        excerpt: '基于人工智能的智能对话助手，为博客访客提供即时帮助和信息查询服务。',
        image: '/assets/images/articles/chatbot.jpg',
        url: '#'
    },
    {
        title: 'Moonlight博客',
        excerpt: '一个梦幻朦胧之美的个人博客空间，记录技术探索和创意思考的点点滴滴。',
        image: '/assets/images/articles/blog.jpg',
        url: '#'
    }
];

// 每页显示的文章数量
var ARTICLES_PER_PAGE = 6;

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 初始化年份
    if (document.getElementById('year')) {
        document.getElementById('year').textContent = new Date().getFullYear();
    }
    
    // 加载个人信息
    loadProfileInfo();
    
    // 加载文章
    loadArticles();
    
    // 设置滚动动画
    setupScrollAnimations();
    
    // 设置分页处理
    setupPagination();
});

// 加载个人信息
function loadProfileInfo() {
    try {
        // 检查是否存在profile-info元素
        var profileInfoElement = document.getElementById('profile-info');
        if (!profileInfoElement) {
            console.log('未找到profile-info元素，跳过加载个人信息');
            return;
        }
        
        // 在现有元素基础上使用静态数据
        var profileData = {
            name: "博主名字",
            bio: "热爱技术和创新，专注于绘画、文字排版，人工智能、云计算和大数据领域的研究与应用。",
            focus: "AI, 云计算, 大数据",
            email: "example@moonlight-blog.com"
        };
        
        var profileHTML = `
            <h3>${profileData.name}</h3>
            <p>${profileData.bio}</p>
            <div class="profile-details">
                <p><strong>专注领域：</strong> ${profileData.focus}</p>
                <p><strong>联系邮箱：</strong> ${profileData.email}</p>
            </div>
        `;
        
        profileInfoElement.innerHTML = profileHTML;
    } catch (error) {
        console.error('加载个人信息时出错:', error);
        if (document.getElementById('profile-info')) {
            document.getElementById('profile-info').innerHTML = `
                <p>加载个人信息时出错。请稍后再试。</p>
            `;
        }
    }
}

// 加载文章
function loadArticles() {
    const urlTag = getQueryParam('tag');
    if (urlTag) currentTag = urlTag;
    fetch('articles/index.json')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                allArticles = data.map(article => ({
                    ...article,
                    image: article.cover || '/assets/images/default-cover.jpg',
                    url: `article.html?file=${encodeURIComponent(article.file)}`
                }));
                totalPages = Math.ceil(allArticles.length / pageSize);
            } else {
                allArticles = articles; // fallback
                totalPages = Math.ceil(allArticles.length / pageSize);
            }
            if (typeof updatePageIndicator === 'function') updatePageIndicator();
            renderTagFilter();
            renderArticles();
            if (typeof updatePaginationButtons === 'function') updatePaginationButtons();
        })
        .catch(err => {
            console.error('加载文章索引失败，使用静态数据', err);
            allArticles = articles;
            totalPages = Math.ceil(allArticles.length / pageSize);
            if (typeof updatePageIndicator === 'function') updatePageIndicator();
            renderTagFilter();
            renderArticles();
            if (typeof updatePaginationButtons === 'function') updatePaginationButtons();
        });
}

// 渲染文章卡片
function renderArticles() {
    var container = document.getElementById('articles-container');
    if (!container) {
        console.error('未找到articles-container元素');
        return;
    }
    container.innerHTML = '';
    var filtered = currentTag ? allArticles.filter(a => Array.isArray(a.tags) && a.tags.includes(currentTag)) : allArticles;
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, filtered.length);
    var articlesToShow = filtered.slice(startIndex, endIndex);
    if (articlesToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>没有找到文章。</p>
            </div>
        `;
        return;
    }
    for (var i = 0; i < articlesToShow.length; i++) {
        var article = articlesToShow[i];
        var articleCard = document.createElement('div');
        articleCard.className = 'article-card glass-panel';
        if (article.top) articleCard.classList.add('article-top');
        // 创建发布日期对象
        var dateStr = article.date || article.publishDate;
        var publishDate = dateStr ? new Date(dateStr) : new Date();
        var formattedDate = publishDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        // 标签HTML
        var tagsHTML = '';
        if (Array.isArray(article.tags) && article.tags.length > 0) {
            tagsHTML = '<div class="article-tags">' + article.tags.map(tag => `<span class="tag">${tag}</span>`).join('') + '</div>';
        }
        // 置顶角标
        var topBadge = article.top ? '<span class="top-badge">置顶</span>' : '';
        // 作者
        var authorHTML = article.author ? `<span class="article-author"><i class="fas fa-user"></i> ${article.author}</span>` : '';
        articleCard.innerHTML = `
            <div class="article-image">
                <img src="${article.image || '/assets/images/default-cover.jpg'}" alt="${article.title}">
                ${topBadge}
            </div>
            <div class="article-content">
                <h3>${article.title}</h3>
                <p>${article.excerpt || article.summary || ""}</p>
                ${tagsHTML}
                <div class="article-meta">
                    <span>${formattedDate}</span>
                    ${authorHTML}
                </div>
            </div>
        `;
        (function(url) {
            articleCard.addEventListener('click', function() {
                window.location.href = url || '#';
            });
        })(article.url);
        container.appendChild(articleCard);
    }
}

// 设置分页处理
function setupPagination() {
    var prevButton = document.getElementById('prev-page');
    var nextButton = document.getElementById('next-page');
    
    if (!prevButton || !nextButton) {
        console.error('分页按钮未找到');
        return;
    }
    
    prevButton.onclick = function() {
        if (currentPage > 1) {
            currentPage--;
            renderArticles();
            updatePageIndicator();
            updatePaginationButtons();
            var articlesSection = document.getElementById('articles');
            if (articlesSection) {
                window.scrollTo({
                    top: articlesSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        }
    };
    
    nextButton.onclick = function() {
        if (currentPage < totalPages) {
            currentPage++;
            renderArticles();
            updatePageIndicator();
            updatePaginationButtons();
            var articlesSection = document.getElementById('articles');
            if (articlesSection) {
                window.scrollTo({
                    top: articlesSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        }
    };
}

// 更新分页指示器
function updatePageIndicator() {
    var indicator = document.getElementById('page-indicator');
    if (indicator) {
        indicator.textContent = currentPage + ' / ' + totalPages;
    }
}

// 更新分页按钮状态
function updatePaginationButtons() {
    var prevButton = document.getElementById('prev-page');
    var nextButton = document.getElementById('next-page');
    
    if (prevButton) prevButton.disabled = currentPage <= 1;
    if (nextButton) nextButton.disabled = currentPage >= totalPages;
}

// 设置滚动动画
function setupScrollAnimations() {
    // 检查IntersectionObserver是否被支持
    if (!('IntersectionObserver' in window)) {
        console.log('IntersectionObserver不被支持，跳过滚动动画');
        return;
    }
    
    var observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    var fadeInElements = document.querySelectorAll('.fade-in');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 选择所有需要观察的元素
    fadeInElements.forEach(function(element) {
        observer.observe(element);
    });
}

// 文章详情页函数
function loadArticleDetails(articleId) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/data/articles/' + articleId + '.json', true);
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    resolve(data);
                } catch (e) {
                    console.error('解析文章数据出错:', e);
                    reject(new Error('无法解析文章数据'));
                }
            } else {
                reject(new Error('无法加载文章详情'));
            }
        };
        xhr.onerror = function() {
            console.error('加载文章详情时出错');
            reject(new Error('网络请求失败'));
        };
        xhr.send();
    });
}

// 下载文件函数
function downloadFile(url, filename) {
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 初始化文章列表
function initializeArticles() {
    var container = document.getElementById('articles-container');
    if (!container) return;
    
    container.innerHTML = ''; // 清空骨架屏
    
    var startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    var endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, articles.length);
    
    for (var i = startIndex; i < endIndex; i++) {
        var article = articles[i];
        var articleElement = createArticleElement(article);
        container.appendChild(articleElement);
    }
}

// 创建文章元素
function createArticleElement(article) {
    var div = document.createElement('div');
    div.className = 'article-card glass-panel';
    
    div.innerHTML = 
        '<div class="article-image" style="background-image: url(\'' + (article.image || '') + '\')"></div>' +
        '<div class="article-content">' +
            '<h3>' + article.title + '</h3>' +
            '<p>' + (article.excerpt || '') + '</p>' +
            '<a href="' + (article.url || '#') + '" class="read-more">阅读更多 <i class="fas fa-arrow-right"></i></a>' +
        '</div>';
    
    return div;
}

// 初始化分页
function initializePagination() {
    var totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
    var prevButton = document.getElementById('prev-page');
    var nextButton = document.getElementById('next-page');
    var pageIndicator = document.getElementById('page-indicator');
    
    // 更新页码显示
    if (pageIndicator) {
        pageIndicator.textContent = currentPage + ' / ' + totalPages;
    }
    
    // 更新按钮状态
    if (prevButton) prevButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === totalPages;
    
    // 添加事件监听器
    if (prevButton) {
        prevButton.onclick = function() {
            if (currentPage > 1) {
                currentPage--;
                initializeArticles();
                initializePagination();
            }
        };
    }
    
    if (nextButton) {
        nextButton.onclick = function() {
            if (currentPage < totalPages) {
                currentPage++;
                initializeArticles();
                initializePagination();
            }
        };
    }
}

// 初始化滚动效果
function initializeScrollEffects() {
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        var scrolled = window.scrollY;
        
        // 视差效果
        var parallaxElement = document.querySelector('.parallax');
        if (parallaxElement) {
            parallaxElement.style.transform = 'translateY(' + (scrolled * 0.5) + 'px)';
        }
        
        // 渐入效果
        var fadeElements = document.querySelectorAll('.fade-in');
        for (var i = 0; i < fadeElements.length; i++) {
            var element = fadeElements[i];
            var elementTop = element.getBoundingClientRect().top;
            var elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('visible');
            }
        }
    });
}

// 新增：自动读取 articles 目录下所有 Markdown 文件并渲染
async function fetchArticlesList() {
    // 这里假设有一个 articles/index.json 或者用 Workers/构建时生成
    // 目前手动维护列表，后续可自动生成
    const files = ['hello-moonlight.md'];
    const articles = [];
    for (const file of files) {
        try {
            const res = await fetch(`/articles/${file}`);
            if (!res.ok) continue;
            const md = await res.text();
            const match = md.match(/^---([\s\S]*?)---/);
            let meta = { file };
            if (match) {
                const fm = match[1].trim();
                fm.split('\n').forEach(line => {
                    const [k, ...v] = line.split(':');
                    meta[k.trim()] = v.join(':').trim().replace(/^"|"$/g, '');
                });
            }
            articles.push(meta);
        } catch (e) { continue; }
    }
    return articles;
}

async function renderArticlesList() {
    const container = document.getElementById('articles-container');
    if (!container) return;
    // 清空骨架屏
    container.innerHTML = '';
    const articles = await fetchArticlesList();
    if (!articles.length) {
        container.innerHTML = '<div>暂无文章。</div>';
        return;
    }
    for (const article of articles) {
        const card = document.createElement('div');
        card.className = 'article-card glass-panel';
        card.innerHTML = `
            <div class="article-image">
                <img src="${article.cover || '/assets/images/default-cover.jpg'}" alt="${article.title || ''}">
            </div>
            <div class="article-content">
                <h3>${article.title || '未命名文章'}</h3>
                <p>${article.excerpt || ''}</p>
                <div class="article-meta">
                    <span>${article.date || ''}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => {
            window.location.href = `article.html?file=${encodeURIComponent(article.file)}`;
        });
        container.appendChild(card);
    }
}

document.addEventListener('DOMContentLoaded', renderArticlesList);

function getAllTags() {
    var tagSet = new Set();
    allArticles.forEach(article => {
        if (Array.isArray(article.tags)) {
            article.tags.forEach(tag => tagSet.add(tag));
        }
    });
    return Array.from(tagSet);
}

function renderTagFilter() {
    var tagFilter = document.getElementById('tag-filter');
    if (!tagFilter) return;
    var tags = getAllTags();
    if (tags.length === 0) {
        tagFilter.innerHTML = '';
        return;
    }
    var html = '<span class="tag-filter-label">标签筛选：</span>';
    html += `<span class="tag tag-filter-item${currentTag===null?' active':''}" data-tag="">全部</span>`;
    tags.forEach(tag => {
        html += `<span class="tag tag-filter-item${currentTag===tag?' active':''}" data-tag="${tag}">${tag}</span>`;
    });
    tagFilter.innerHTML = html;
    // 绑定点击事件
    var items = tagFilter.querySelectorAll('.tag-filter-item');
    items.forEach(item => {
        item.onclick = function() {
            var tag = this.getAttribute('data-tag');
            currentTag = tag || null;
            currentPage = 1;
            renderTagFilter();
            renderArticles();
        };
    });
}

function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}