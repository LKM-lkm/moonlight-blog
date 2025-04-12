// 主要功能处理脚本

// 博客文章页面大小和当前页码
let pageSize = 6;
let currentPage = 1;
let totalPages = 1;
let allArticles = [];

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
export async function loadArticleDetails(articleId) {
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
export function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}