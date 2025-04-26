// 主要功能处理脚本

// 博客文章页面大小和当前页码
var pageSize = 6;
var currentPage = 1;
var totalPages = 1;
var allArticles = [];

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
    try {
        // 直接使用静态数据渲染文章
        allArticles = articles;
        totalPages = Math.ceil(allArticles.length / pageSize);
        
        if (typeof updatePageIndicator === 'function') updatePageIndicator();
        renderArticles();
        if (typeof updatePaginationButtons === 'function') updatePaginationButtons();
    } catch (error) {
        console.error('加载文章时出错:', error);
        var articlesContainer = document.getElementById('articles-container');
        if (articlesContainer) {
            articlesContainer.innerHTML = `
                <div class="error-message">
                    <p>加载文章时出错。请稍后再试。</p>
                </div>
            `;
        }
    }
}

// 渲染文章卡片
function renderArticles() {
    var container = document.getElementById('articles-container');
    if (!container) {
        console.error('未找到articles-container元素');
        return;
    }
    
    container.innerHTML = '';
    
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, allArticles.length);
    
    var articlesToShow = allArticles.slice(startIndex, endIndex);
    
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
        if (article.id) articleCard.dataset.id = article.id;
        
        // 创建发布日期对象
        var publishDate = article.publishDate ? new Date(article.publishDate) : new Date();
        var formattedDate = publishDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        articleCard.innerHTML = `
            <div class="article-image">
                <img src="${article.image || '/assets/images/default-cover.jpg'}" alt="${article.title}">
            </div>
            <div class="article-content">
                <h3>${article.title}</h3>
                <p>${article.excerpt || article.summary || ""}</p>
                <div class="article-meta">
                    <span>${formattedDate}</span>
                    <span>${article.readTime || "5"} 分钟阅读</span>
                </div>
            </div>
        `;
        
        // 添加点击事件
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
async function loadArticleDetails(articleId) {
    try {
        const response = await fetch(`/data/articles/${articleId}.json`);
        if (!response.ok) {
            throw new Error('无法加载文章详情');
        }
        
        return await response.json();
    } catch (error) {
        console.error('加载文章详情时出错:', error);
        return null;
    }
}

// 下载文件函数
function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 初始化文章列表
function initializeArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = ''; // 清空骨架屏
    
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, articles.length);
    
    for (let i = startIndex; i < endIndex; i++) {
        const article = articles[i];
        const articleElement = createArticleElement(article);
        container.appendChild(articleElement);
    }
}

// 创建文章元素
function createArticleElement(article) {
    const div = document.createElement('div');
    div.className = 'article-card glass-panel';
    
    div.innerHTML = `
        <div class="article-image" style="background-image: url('${article.image}')"></div>
        <div class="article-content">
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <a href="${article.url}" class="read-more">阅读更多 <i class="fas fa-arrow-right"></i></a>
        </div>
    `;
    
    return div;
}

// 初始化分页
function initializePagination() {
    const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    
    // 更新页码显示
    pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    
    // 更新按钮状态
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    
    // 添加事件监听器
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            initializeArticles();
            initializePagination();
        }
    };
    
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            initializeArticles();
            initializePagination();
        }
    };
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