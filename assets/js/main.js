// 主要功能处理脚本

// 博客文章页面大小和当前页码
let pageSize = 6;
let currentPage = 1;
let totalPages = 1;
let allArticles = [];

// 文章数据
const articles = [
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
const ARTICLES_PER_PAGE = 6;

// 初始化函数
document.addEventListener('DOMContentLoaded', () => {
    // 初始化年份
    document.getElementById('year').textContent = new Date().getFullYear();
    
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
async function loadProfileInfo() {
    try {
        const response = await fetch('/data/profile.json');
        if (!response.ok) {
            throw new Error('无法加载个人信息');
        }
        
        const profileData = await response.json();
        const profileInfo = document.getElementById('profile-info');
        
        let profileHTML = `
            <h3>${profileData.name}</h3>
            <p>${profileData.bio}</p>
            <div class="profile-details">
                <p><strong>专注领域：</strong> ${profileData.focus}</p>
                <p><strong>联系邮箱：</strong> ${profileData.email}</p>
            </div>
        `;
        
        profileInfo.innerHTML = profileHTML;
    } catch (error) {
        console.error('加载个人信息时出错:', error);
        document.getElementById('profile-info').innerHTML = `
            <p>加载个人信息时出错。请稍后再试。</p>
        `;
    }
}

// 加载文章
async function loadArticles() {
    try {
        const response = await fetch('/data/articles/index.json');
        if (!response.ok) {
            throw new Error('无法加载文章索引');
        }
        
        const articlesIndex = await response.json();
        allArticles = articlesIndex.articles;
        totalPages = Math.ceil(allArticles.length / pageSize);
        
        updatePageIndicator();
        renderArticles();
        updatePaginationButtons();
    } catch (error) {
        console.error('加载文章时出错:', error);
        document.getElementById('articles-container').innerHTML = `
            <div class="error-message">
                <p>加载文章时出错。请稍后再试。</p>
            </div>
        `;
    }
}

// 渲染文章卡片
function renderArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, allArticles.length);
    
    const articlesToShow = allArticles.slice(startIndex, endIndex);
    
    if (articlesToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>没有找到文章。</p>
            </div>
        `;
        return;
    }
    
    for (const article of articlesToShow) {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card glass-panel';
        articleCard.dataset.id = article.id;
        
        // 创建发布日期对象
        const publishDate = new Date(article.publishDate);
        const formattedDate = publishDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        articleCard.innerHTML = `
            <div class="article-image">
                <img src="${article.coverImage || '/assets/images/default-cover.jpg'}" alt="${article.title}">
            </div>
            <div class="article-content">
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <div class="article-meta">
                    <span>${formattedDate}</span>
                    <span>${article.readTime} 分钟阅读</span>
                </div>
            </div>
        `;
        
        // 添加点击事件
        articleCard.addEventListener('click', () => {
            window.location.href = `/article.html?id=${article.id}`;
        });
        
        container.appendChild(articleCard);
    }
}

// 设置分页处理
function setupPagination() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderArticles();
            updatePageIndicator();
            updatePaginationButtons();
            window.scrollTo({
                top: document.getElementById('articles').offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderArticles();
            updatePageIndicator();
            updatePaginationButtons();
            window.scrollTo({
                top: document.getElementById('articles').offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
}

// 更新分页指示器
function updatePageIndicator() {
    document.getElementById('page-indicator').textContent = `${currentPage} / ${totalPages}`;
}

// 更新分页按钮状态
function updatePaginationButtons() {
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// 设置滚动动画
function setupScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 选择所有需要观察的元素
    document.querySelectorAll('.fade-in, .glass-panel').forEach(element => {
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
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        // 视差效果
        document.querySelector('.parallax').style.transform = `translateY(${scrolled * 0.5}px)`;
        
        // 渐入效果
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('visible');
            }
        });
    });
}