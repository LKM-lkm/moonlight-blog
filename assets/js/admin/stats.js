import { checkAuth, getToken } from '../auth.js';

// 确保用户已登录
checkAuth();

// 图表配置
const chartConfig = {
    type: 'line',
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
};

// 初始化页面
async function initializePage() {
    // 初始化事件监听
    initializeEventListeners();
    
    // 加载初始数据
    await loadInitialData();
    
    // 加载分类和标签选项
    await loadFilterOptions();
}

// 初始化事件监听
function initializeEventListeners() {
    // 时间周期选择
    const periodSelect = document.getElementById('period-select');
    periodSelect.addEventListener('change', handlePeriodChange);
    
    // 自定义日期范围
    const customDateRange = document.getElementById('custom-date-range');
    const dateInputs = customDateRange.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => input.addEventListener('change', loadTrendsData));
    
    // 图表类型切换
    const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
    chartTypeBtns.forEach(btn => btn.addEventListener('click', handleChartTypeChange));
    
    // 指标切换
    const metricToggles = document.querySelectorAll('.metric-toggle input');
    metricToggles.forEach(toggle => toggle.addEventListener('change', updateTrendsChart));
    
    // 数据对比
    const comparisonToggle = document.getElementById('enable-comparison');
    comparisonToggle.addEventListener('change', handleComparisonToggle);
    
    // 热门文章筛选
    document.getElementById('popular-metric').addEventListener('change', loadPopularArticles);
    document.getElementById('time-range').addEventListener('change', loadPopularArticles);
    document.getElementById('display-count').addEventListener('change', loadPopularArticles);
    document.getElementById('refresh-popular').addEventListener('click', loadPopularArticles);
    
    // 导出格式选择
    document.getElementById('export-data').addEventListener('click', exportData);
}

// 加载初始数据
async function loadInitialData() {
    await Promise.all([
        loadOverallStats(),
        loadTrendsData(),
        loadPopularArticles(),
        loadCategoryStats(),
        loadTagStats()
    ]);
}

// 加载筛选器选项
async function loadFilterOptions() {
    try {
        const [categories, tags] = await Promise.all([
            fetch('/api/categories').then(res => res.json()),
            fetch('/api/tags').then(res => res.json())
        ]);
        
        populateFilterOptions('category-filter', categories.data);
        populateFilterOptions('tag-filter', tags.data);
    } catch (error) {
        console.error('加载筛选选项失败:', error);
    }
}

// 填充筛选器选项
function populateFilterOptions(elementId, options) {
    const select = document.getElementById(elementId);
    const fragment = document.createDocumentFragment();
    
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option._id;
        optElement.textContent = option.name;
        fragment.appendChild(optElement);
    });
    
    select.appendChild(fragment);
}

// 处理时间周期变化
function handlePeriodChange(event) {
    const customDateRange = document.getElementById('custom-date-range');
    customDateRange.style.display = event.target.value === 'custom' ? 'flex' : 'none';
    loadTrendsData();
}

// 处理图表类型切换
function handleChartTypeChange(event) {
    const buttons = document.querySelectorAll('.chart-type-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const chartType = event.target.dataset.type;
    updateChartType(chartType);
}

// 更新图表类型
function updateChartType(type) {
    if (window.trendsChart) {
        window.trendsChart.config.type = type;
        window.trendsChart.update();
    }
}

// 处理数据对比切换
function handleComparisonToggle(event) {
    const comparisonType = document.getElementById('comparison-type');
    comparisonType.disabled = !event.target.checked;
    loadTrendsData();
}

// 导出数据
async function exportData() {
    try {
        const format = document.getElementById('export-format').value;
        const data = await collectExportData();
        
        switch (format) {
            case 'json':
                downloadJson(data);
                break;
            case 'csv':
                downloadCsv(data);
                break;
            case 'excel':
                downloadExcel(data);
                break;
        }
    } catch (error) {
        console.error('导出数据失败:', error);
        alert('导出数据失败，请稍后重试');
    }
}

// 收集导出数据
async function collectExportData() {
    const [overall, trends, popular] = await Promise.all([
        fetch('/api/stats/overall', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        }).then(res => res.json()),
        fetch('/api/stats/trends?period=month', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        }).then(res => res.json()),
        fetch('/api/stats/popular').then(res => res.json())
    ]);

    return {
        overall: overall.data,
        trends: trends.data,
        popular: popular.data,
        exportDate: new Date().toISOString()
    };
}

// 下载JSON文件
function downloadJson(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, 'json');
}

// 下载CSV文件
function downloadCsv(data) {
    // 将数据转换为CSV格式
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, 'csv');
}

// 下载Excel文件
function downloadExcel(data) {
    // 这里需要添加Excel导出逻辑
    // 可以使用SheetJS等库来实现
    alert('Excel导出功能即将推出');
}

// 通用下载文件函数
function downloadFile(blob, format) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-stats-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 转换数据为CSV格式
function convertToCSV(data) {
    // 实现数据到CSV的转换逻辑
    // 这里需要根据具体数据结构来实现
    return '';
}

// 加载总体统计
async function loadOverallStats() {
    try {
        const response = await fetch('/api/stats/overall', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const data = await response.json();

        if (data.status === 'success') {
            document.getElementById('total-articles').textContent = data.data.articles.total;
            document.getElementById('total-views').textContent = formatNumber(data.data.engagement.views);
            document.getElementById('total-comments').textContent = formatNumber(data.data.engagement.comments);
            document.getElementById('total-likes').textContent = formatNumber(data.data.engagement.likes);
        }
    } catch (error) {
        console.error('加载总体统计失败:', error);
        showError('总体统计');
    }
}

// 加载趋势数据
async function loadTrendsData() {
    try {
        const period = document.getElementById('period-select').value;
        const response = await fetch(`/api/stats/trends?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const data = await response.json();

        if (data.status === 'success') {
            renderTrendsChart(data.data.trends);
        }
    } catch (error) {
        console.error('加载趋势数据失败:', error);
        showError('趋势图表');
    }
}

// 渲染趋势图表
function renderTrendsChart(trends) {
    const ctx = document.getElementById('trends-chart').getContext('2d');
    const dates = trends.map(t => t._id.date);
    const views = trends.map(t => t.views);
    const likes = trends.map(t => t.likes);
    const comments = trends.map(t => t.comments);

    const config = {
        ...chartConfig,
        data: {
            labels: dates,
            datasets: [
                {
                    label: '浏览量',
                    data: views,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: '点赞数',
                    data: likes,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                },
                {
                    label: '评论数',
                    data: comments,
                    borderColor: 'rgb(153, 102, 255)',
                    tension: 0.1
                }
            ]
        }
    };

    if (window.trendsChart) {
        window.trendsChart.destroy();
    }
    window.trendsChart = new Chart(ctx, config);
}

// 加载热门文章
async function loadPopularArticles() {
    try {
        const response = await fetch('/api/stats/popular?limit=5');
        const data = await response.json();

        if (data.status === 'success') {
            renderPopularArticles(data.data.articles);
        }
    } catch (error) {
        console.error('加载热门文章失败:', error);
        showError('热门文章');
    }
}

// 渲染热门文章列表
function renderPopularArticles(articles) {
    const container = document.getElementById('popular-articles');
    container.innerHTML = articles.map((article, index) => `
        <div class="article-item">
            <span class="article-rank">#${index + 1}</span>
            <div class="article-info">
                <div class="article-title">${article.title}</div>
                <div class="article-stats">
                    <span><i class="fas fa-eye"></i> ${formatNumber(article.views)}</span>
                    <span><i class="fas fa-heart"></i> ${formatNumber(article.likes)}</span>
                    <span><i class="fas fa-comment"></i> ${formatNumber(article.commentsCount)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 加载分类统计
async function loadCategoryStats() {
    try {
        const response = await fetch('/api/stats/categories');
        const data = await response.json();

        if (data.status === 'success') {
            renderCategoryChart(data.data.categories);
        }
    } catch (error) {
        console.error('加载分类统计失败:', error);
        showError('分类统计');
    }
}

// 渲染分类图表
function renderCategoryChart(categories) {
    const ctx = document.getElementById('categories-chart').getContext('2d');
    const config = {
        type: 'doughnut',
        data: {
            labels: categories.map(c => c._id),
            datasets: [{
                data: categories.map(c => c.count),
                backgroundColor: generateColors(categories.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    };

    if (window.categoryChart) {
        window.categoryChart.destroy();
    }
    window.categoryChart = new Chart(ctx, config);
}

// 加载标签统计
async function loadTagStats() {
    try {
        const response = await fetch('/api/stats/tags');
        const data = await response.json();

        if (data.status === 'success') {
            renderTagCloud(data.data.tags);
        }
    } catch (error) {
        console.error('加载标签统计失败:', error);
        showError('标签统计');
    }
}

// 渲染标签云
function renderTagCloud(tags) {
    const container = document.getElementById('tag-cloud');
    const maxCount = Math.max(...tags.map(t => t.count));
    const minCount = Math.min(...tags.map(t => t.count));
    
    container.innerHTML = tags.map(tag => {
        const size = calculateTagSize(tag.count, minCount, maxCount);
        return `
            <span class="tag-item" style="--tag-size: ${size}rem">
                ${tag._id} (${tag.count})
            </span>
        `;
    }).join('');
}

// 辅助函数
function formatNumber(num) {
    return new Intl.NumberFormat('zh-CN').format(num);
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 360 / count) % 360;
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
}

function calculateTagSize(count, min, max) {
    const minSize = 0.8;
    const maxSize = 2;
    return minSize + (count - min) * (maxSize - minSize) / (max - min);
}

function showError(component) {
    // 显示错误提示
    const errorHtml = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            加载${component}失败，请稍后重试
        </div>
    `;
    // 根据组件类型显示错误
    // 这里可以根据需要添加具体的错误处理逻辑
}

// 初始化页面
initializePage(); 