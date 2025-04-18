// 评论管理功能实现
document.addEventListener('DOMContentLoaded', () => {
    // 初始化变量
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 1;
    let comments = [];
    let selectedComments = new Set();

    // 加载评论列表
    async function loadComments(page = 1) {
        try {
            // 这里应该是从API获取数据
            // 模拟数据
            comments = [
                {
                    id: 1,
                    user: {
                        name: '张三',
                        avatar: '../assets/img/avatar-1.jpg'
                    },
                    content: '这篇文章写得很好，对我帮助很大！',
                    article: {
                        id: 1,
                        title: 'Vue3 组件开发实践'
                    },
                    status: 'pending',
                    createTime: '2024-03-15 14:30'
                },
                {
                    id: 2,
                    user: {
                        name: '李四',
                        avatar: '../assets/img/avatar-2.jpg'
                    },
                    content: '期待作者的下一篇文章！',
                    article: {
                        id: 2,
                        title: 'React Hooks 最佳实践'
                    },
                    status: 'approved',
                    createTime: '2024-03-14 16:45'
                }
            ];

            renderComments();
            updatePagination();
        } catch (error) {
            console.error('加载评论失败:', error);
            showNotification('加载评论失败', 'error');
        }
    }

    // 渲染评论列表
    function renderComments() {
        const commentsList = document.querySelector('.comments-list');
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-info">
                        <img src="${comment.user.avatar}" alt="${comment.user.name}" class="user-avatar">
                        <div class="user-info">
                            <h3>${comment.user.name}</h3>
                            <span class="comment-meta">
                                <i class="fas fa-clock"></i> ${comment.createTime}
                            </span>
                        </div>
                    </div>
                    <div class="comment-status status-${comment.status}">
                        ${getStatusName(comment.status)}
                    </div>
                </div>
                <div class="comment-content">
                    <p>${comment.content}</p>
                    <div class="comment-article">
                        <i class="fas fa-link"></i>
                        <a href="#">${comment.article.title}</a>
                    </div>
                </div>
                <div class="comment-actions">
                    ${comment.status === 'pending' ? `
                        <button class="btn btn-sm btn-success approve-btn" data-id="${comment.id}">
                            <i class="fas fa-check"></i> 通过
                        </button>
                        <button class="btn btn-sm btn-danger reject-btn" data-id="${comment.id}">
                            <i class="fas fa-times"></i> 拒绝
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline delete-btn" data-id="${comment.id}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                    <button class="btn btn-sm btn-outline reply-btn" data-id="${comment.id}">
                        <i class="fas fa-reply"></i> 回复
                    </button>
                </div>
            </div>
        `).join('');

        // 绑定事件
        bindCommentEvents();
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

    // 获取状态名称
    function getStatusName(status) {
        const statuses = {
            pending: '待审核',
            approved: '已通过',
            rejected: '已拒绝'
        };
        return statuses[status] || status;
    }

    // 显示通知
    function showNotification(message, type = 'info') {
        // 这里可以实现通知功能
        console.log(`${type}: ${message}`);
    }

    // 打开回复评论模态框
    function openReplyModal(comment) {
        const modal = document.getElementById('replyModal');
        const originalComment = modal.querySelector('.original-comment');
        
        // 填充原始评论信息
        originalComment.querySelector('.user-avatar').src = comment.user.avatar;
        originalComment.querySelector('.user-info h3').textContent = comment.user.name;
        originalComment.querySelector('.comment-meta').textContent = comment.createTime;
        originalComment.querySelector('.comment-content p').textContent = comment.content;
        
        // 清空回复内容
        document.getElementById('replyContent').value = '';
        
        // 存储评论ID
        modal.dataset.commentId = comment.id;
        
        modal.classList.add('show');
    }

    // 关闭回复评论模态框
    function closeReplyModal() {
        const modal = document.getElementById('replyModal');
        modal.classList.remove('show');
    }

    // 审核评论
    async function reviewComment(id, action) {
        try {
            // 这里应该是调用API审核评论
            console.log(`${action}评论:`, id);
            showNotification(`评论${action === 'approve' ? '通过' : '拒绝'}成功`);
            loadComments(currentPage);
        } catch (error) {
            console.error('审核评论失败:', error);
            showNotification('审核评论失败', 'error');
        }
    }

    // 删除评论
    async function deleteComment(id) {
        if (!confirm('确定要删除这条评论吗？')) return;
        
        try {
            // 这里应该是调用API删除评论
            console.log('删除评论:', id);
            showNotification('评论删除成功');
            loadComments(currentPage);
        } catch (error) {
            console.error('删除评论失败:', error);
            showNotification('删除评论失败', 'error');
        }
    }

    // 回复评论
    async function replyComment(id, content) {
        try {
            // 这里应该是调用API回复评论
            console.log('回复评论:', { id, content });
            showNotification('回复成功');
            closeReplyModal();
            loadComments(currentPage);
        } catch (error) {
            console.error('回复评论失败:', error);
            showNotification('回复失败', 'error');
        }
    }

    // 批量删除评论
    async function batchDeleteComments() {
        if (selectedComments.size === 0) {
            showNotification('请选择要删除的评论', 'warning');
            return;
        }
        
        if (!confirm(`确定要删除选中的 ${selectedComments.size} 条评论吗？`)) return;
        
        try {
            // 这里应该是调用API批量删除评论
            console.log('批量删除评论:', Array.from(selectedComments));
            showNotification('评论删除成功');
            selectedComments.clear();
            loadComments(currentPage);
        } catch (error) {
            console.error('删除评论失败:', error);
            showNotification('删除评论失败', 'error');
        }
    }

    // 绑定评论相关事件
    function bindCommentEvents() {
        // 通过按钮
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                reviewComment(id, 'approve');
            });
        });

        // 拒绝按钮
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                reviewComment(id, 'reject');
            });
        });

        // 删除按钮
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                deleteComment(id);
            });
        });

        // 回复按钮
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const comment = comments.find(c => c.id === id);
                if (comment) {
                    openReplyModal(comment);
                }
            });
        });
    }

    // 绑定页面事件
    function bindPageEvents() {
        // 批量删除按钮
        document.getElementById('batchDeleteBtn').addEventListener('click', batchDeleteComments);

        // 模态框关闭按钮
        document.querySelector('.close-btn').addEventListener('click', closeReplyModal);

        // 取消按钮
        document.getElementById('cancelBtn').addEventListener('click', closeReplyModal);

        // 提交按钮
        document.getElementById('submitBtn').addEventListener('click', () => {
            const modal = document.getElementById('replyModal');
            const id = parseInt(modal.dataset.commentId);
            const content = document.getElementById('replyContent').value.trim();
            
            if (!content) {
                showNotification('请输入回复内容', 'warning');
                return;
            }
            
            replyComment(id, content);
        });

        // 分页按钮
        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadComments(currentPage);
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadComments(currentPage);
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
                    loadComments(currentPage);
                }
            }, 300);
        });

        // 筛选器
        document.getElementById('statusFilter').addEventListener('change', () => {
            loadComments(currentPage);
        });

        document.getElementById('articleFilter').addEventListener('change', () => {
            loadComments(currentPage);
        });
    }

    // 初始化
    loadComments();
    bindPageEvents();
}); 