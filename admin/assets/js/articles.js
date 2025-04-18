// 文章管理功能实现
document.addEventListener('DOMContentLoaded', () => {
    // 初始化变量
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 1;
    let articles = [];
    let selectedArticles = new Set();
    let editor = null;

    // 初始化编辑器
    function initEditor() {
        editor = new EasyMDE({
            element: document.getElementById('articleContent'),
            spellChecker: false,
            autosave: {
                enabled: true,
                uniqueId: 'articleContent',
                delay: 1000,
            },
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', 'image', 'table', '|',
                'preview', 'side-by-side', 'fullscreen', '|',
                'guide'
            ]
        });
    }

    // 加载文章列表
    async function loadArticles(page = 1) {
        try {
            // 这里应该是从API获取数据
            // 模拟数据
            articles = [
                {
                    id: 1,
                    title: 'Vue3 组件开发实践',
                    category: 'tech',
                    status: 'published',
                    publishDate: '2024-03-15',
                    views: 1234,
                    comments: 23,
                    cover: '../assets/img/article-cover-1.jpg'
                },
                {
                    id: 2,
                    title: 'React Hooks 最佳实践',
                    category: 'tech',
                    status: 'draft',
                    publishDate: '2024-03-14',
                    views: 856,
                    comments: 15,
                    cover: '../assets/img/article-cover-2.jpg'
                }
            ];

            renderArticles();
            updatePagination();
        } catch (error) {
            console.error('加载文章失败:', error);
            showNotification('加载文章失败', 'error');
        }
    }

    // 渲染文章列表
    function renderArticles() {
        const tbody = document.getElementById('articlesTableBody');
        tbody.innerHTML = articles.map(article => `
            <tr>
                <td>
                    <input type="checkbox" value="${article.id}" ${selectedArticles.has(article.id) ? 'checked' : ''}>
                </td>
                <td>
                    <img src="${article.cover}" alt="${article.title}" class="article-cover">
                </td>
                <td>${article.title}</td>
                <td>${getCategoryName(article.category)}</td>
                <td>
                    <span class="article-status status-${article.status}">
                        ${getStatusName(article.status)}
                    </span>
                </td>
                <td>${article.publishDate}</td>
                <td>${article.views}</td>
                <td>${article.comments}</td>
                <td>
                    <div class="article-actions">
                        <button class="btn-icon edit-btn" data-id="${article.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-btn" data-id="${article.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // 绑定事件
        bindArticleEvents();
    }

    // 更新分页
    function updatePagination() {
        const pageNumbers = document.querySelector('.page-numbers');
        let html = '';
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="btn btn-outline ${i === currentPage ? 'active' : ''}">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += '<span>...</span>';
            }
        }
        
        pageNumbers.innerHTML = html;
        
        // 更新按钮状态
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    }

    // 获取分类名称
    function getCategoryName(category) {
        const categories = {
            tech: '技术',
            life: '生活',
            travel: '旅行'
        };
        return categories[category] || category;
    }

    // 获取状态名称
    function getStatusName(status) {
        const statuses = {
            published: '已发布',
            draft: '草稿'
        };
        return statuses[status] || status;
    }

    // 显示通知
    function showNotification(message, type = 'info') {
        // 这里可以实现通知功能
        console.log(`${type}: ${message}`);
    }

    // 打开文章编辑模态框
    function openArticleModal(article = null) {
        const modal = document.getElementById('articleModal');
        const form = document.getElementById('articleForm');
        
        if (article) {
            // 编辑模式
            form.dataset.id = article.id;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleStatus').value = article.status;
            document.getElementById('articleTags').value = article.tags?.join(', ') || '';
            document.getElementById('articleSummary').value = article.summary || '';
            editor.value(article.content || '');
        } else {
            // 新建模式
            form.dataset.id = '';
            form.reset();
            editor.value('');
        }
        
        modal.classList.add('show');
    }

    // 保存文章
    async function saveArticle(formData) {
        try {
            // 这里应该是调用API保存数据
            console.log('保存文章:', formData);
            showNotification('文章保存成功');
            closeArticleModal();
            loadArticles(currentPage);
        } catch (error) {
            console.error('保存文章失败:', error);
            showNotification('保存文章失败', 'error');
        }
    }

    // 关闭文章编辑模态框
    function closeArticleModal() {
        const modal = document.getElementById('articleModal');
        modal.classList.remove('show');
    }

    // 删除文章
    async function deleteArticle(id) {
        if (!confirm('确定要删除这篇文章吗？')) return;
        
        try {
            // 这里应该是调用API删除数据
            console.log('删除文章:', id);
            showNotification('文章删除成功');
            loadArticles(currentPage);
        } catch (error) {
            console.error('删除文章失败:', error);
            showNotification('删除文章失败', 'error');
        }
    }

    // 批量删除文章
    async function batchDeleteArticles() {
        if (selectedArticles.size === 0) {
            showNotification('请选择要删除的文章', 'warning');
            return;
        }
        
        if (!confirm(`确定要删除选中的 ${selectedArticles.size} 篇文章吗？`)) return;
        
        try {
            // 这里应该是调用API批量删除数据
            console.log('批量删除文章:', Array.from(selectedArticles));
            showNotification('文章删除成功');
            selectedArticles.clear();
            loadArticles(currentPage);
        } catch (error) {
            console.error('删除文章失败:', error);
            showNotification('删除文章失败', 'error');
        }
    }

    // 绑定文章相关事件
    function bindArticleEvents() {
        // 选择框事件
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.value);
                if (e.target.checked) {
                    selectedArticles.add(id);
                } else {
                    selectedArticles.delete(id);
                }
                updateBatchDeleteButton();
            });
        });

        // 全选事件
        document.getElementById('selectAll').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                const id = parseInt(checkbox.value);
                if (e.target.checked) {
                    selectedArticles.add(id);
                } else {
                    selectedArticles.delete(id);
                }
            });
            updateBatchDeleteButton();
        });

        // 编辑按钮事件
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const article = articles.find(a => a.id === id);
                if (article) {
                    openArticleModal(article);
                }
            });
        });

        // 删除按钮事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                deleteArticle(id);
            });
        });
    }

    // 更新批量删除按钮状态
    function updateBatchDeleteButton() {
        const btn = document.getElementById('batchDeleteBtn');
        btn.disabled = selectedArticles.size === 0;
    }

    // 绑定页面事件
    function bindPageEvents() {
        // 新建文章按钮
        document.getElementById('newArticleBtn').addEventListener('click', () => {
            openArticleModal();
        });

        // 批量删除按钮
        document.getElementById('batchDeleteBtn').addEventListener('click', batchDeleteArticles);

        // 模态框关闭按钮
        document.querySelector('.close-btn').addEventListener('click', closeArticleModal);

        // 取消按钮
        document.getElementById('cancelBtn').addEventListener('click', closeArticleModal);

        // 保存按钮
        document.getElementById('saveBtn').addEventListener('click', () => {
            const form = document.getElementById('articleForm');
            const formData = {
                id: form.dataset.id || null,
                title: document.getElementById('articleTitle').value,
                category: document.getElementById('articleCategory').value,
                status: document.getElementById('articleStatus').value,
                tags: document.getElementById('articleTags').value.split(',').map(tag => tag.trim()),
                summary: document.getElementById('articleSummary').value,
                content: editor.value()
            };
            saveArticle(formData);
        });

        // 分页按钮
        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadArticles(currentPage);
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadArticles(currentPage);
            }
        });

        // 搜索框
        const searchInput = document.querySelector('.search-box input');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const keyword = e.target.value.trim();
                if (keyword) {
                    // 这里可以实现搜索功能
                    console.log('搜索:', keyword);
                } else {
                    loadArticles(currentPage);
                }
            }, 300);
        });

        // 筛选器
        document.getElementById('categoryFilter').addEventListener('change', () => {
            loadArticles(currentPage);
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            loadArticles(currentPage);
        });
    }

    // 初始化
    initEditor();
    loadArticles();
    bindPageEvents();
}); 