/**
 * 用户管理页面JavaScript
 * 
 * 功能包括：
 * - 加载用户列表（支持分页、搜索和过滤）
 * - 创建用户
 * - 编辑用户
 * - 删除用户
 * - 表单验证
 * - 消息提示
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    init();
});

// 全局变量
let currentPage = 1;
let totalPages = 1;
let totalUsers = 0;
const usersPerPage = 10;
let searchQuery = '';
let roleFilterValue = '';
let statusFilterValue = -1;

// DOM元素
const userTableBody = document.getElementById('userTableBody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const roleFilter = document.getElementById('roleFilter');
const statusFilter = document.getElementById('statusFilter');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const createUserBtn = document.getElementById('createUserBtn');
const userModal = document.getElementById('userModal');
const deleteModal = document.getElementById('deleteModal');
const userForm = document.getElementById('userForm');
const modalTitle = document.getElementById('modalTitle');
const userIdInput = document.getElementById('userId');
const deleteUsernameSpan = document.getElementById('deleteUsername');
const loadingIndicator = document.getElementById('loadingIndicator');
const messageBox = document.getElementById('messageBox');

// 初始化
function init() {
    // 加载用户列表
    loadUsers();
    
    // 绑定事件
    bindEvents();
}

// 绑定事件
function bindEvents() {
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', function() {
        searchQuery = searchInput.value.trim();
        currentPage = 1;
        loadUsers();
    });
    
    // 搜索输入框回车事件
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value.trim();
            currentPage = 1;
            loadUsers();
        }
    });
    
    // 角色过滤变化事件
    roleFilter.addEventListener('change', function() {
        roleFilterValue = roleFilter.value;
        currentPage = 1;
        loadUsers();
    });
    
    // 状态过滤变化事件
    statusFilter.addEventListener('change', function() {
        statusFilterValue = parseInt(statusFilter.value);
        currentPage = 1;
        loadUsers();
    });
    
    // 上一页按钮点击事件
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadUsers();
        }
    });
    
    // 下一页按钮点击事件
    nextPageBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadUsers();
        }
    });
    
    // 创建用户按钮点击事件
    createUserBtn.addEventListener('click', function() {
        openUserModal();
    });
    
    // 用户表单提交事件
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveUser();
    });
    
    // 取消按钮点击事件
    document.getElementById('cancelBtn').addEventListener('click', function() {
        closeUserModal();
    });
    
    // 取消删除按钮点击事件
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
        closeDeleteModal();
    });
    
    // 确认删除按钮点击事件
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        const userId = this.getAttribute('data-user-id');
        deleteUser(userId);
    });
    
    // 关闭模态框按钮点击事件
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal.id === 'userModal') {
                closeUserModal();
            } else if (modal.id === 'deleteModal') {
                closeDeleteModal();
            }
        });
    });
    
    // 密码显示/隐藏切换
    document.querySelector('.toggle-password').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.innerHTML = '<i class="icon-eye-off"></i>';
        } else {
            passwordInput.type = 'password';
            this.innerHTML = '<i class="icon-eye"></i>';
        }
    });
}

// 加载用户列表
function loadUsers() {
    showLoading();
    
    // 构建查询参数
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', usersPerPage);
    
    if (searchQuery) {
        params.append('search', searchQuery);
    }
    
    if (roleFilterValue) {
        params.append('role', roleFilterValue);
    }
    
    if (statusFilterValue !== -1) {
        params.append('status', statusFilterValue);
    }
    
    // 发送请求
    fetch(`../api/users.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                renderUsers(data.users);
                updatePagination(data.total, data.pages);
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            showMessage('加载用户列表失败', 'error');
            console.error('Error:', error);
        });
}

// 渲染用户列表
function renderUsers(users) {
    userTableBody.innerHTML = '';
    
    if (users.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" class="text-center">没有找到用户</td>`;
        userTableBody.appendChild(tr);
        return;
    }
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        // 状态指示器
        const statusClass = user.status === 1 ? 'status-active' : 'status-inactive';
        const statusText = user.status === 1 ? '启用' : '禁用';
        
        // 角色指示器
        let roleClass = '';
        switch (user.role) {
            case 'admin':
                roleClass = 'role-admin';
                break;
            case 'editor':
                roleClass = 'role-editor';
                break;
            case 'user':
                roleClass = 'role-user';
                break;
        }
        
        // 格式化日期
        const lastLogin = user.last_login ? formatDate(user.last_login) : '从未登录';
        const createdAt = formatDate(user.created_at);
        
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${roleClass}">${user.role}</span></td>
            <td><span class="status-badge ${statusClass}"></span>${statusText}</td>
            <td>${lastLogin}</td>
            <td>${createdAt}</td>
            <td class="actions">
                <button class="btn btn-edit" data-id="${user.id}">编辑</button>
                <button class="btn btn-delete" data-id="${user.id}">删除</button>
            </td>
        `;
        
        userTableBody.appendChild(tr);
    });
    
    // 绑定编辑和删除按钮事件
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openUserModal(userId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openDeleteModal(userId);
        });
    });
}

// 更新分页
function updatePagination(total, pages) {
    totalUsers = total;
    totalPages = pages;
    
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// 打开用户模态框
function openUserModal(userId = null) {
    // 重置表单
    userForm.reset();
    userIdInput.value = '';
    
    if (userId) {
        // 编辑用户
        modalTitle.textContent = '编辑用户';
        userIdInput.value = userId;
        
        // 加载用户数据
        showLoading();
        fetch(`../api/users.php?id=${userId}`)
            .then(response => response.json())
            .then(data => {
                hideLoading();
                
                if (data.success) {
                    const user = data.user;
                    
                    // 填充表单
                    document.getElementById('username').value = user.username;
                    document.getElementById('email').value = user.email;
                    document.getElementById('role').value = user.role;
                    document.getElementById('status').value = user.status;
                    
                    if (user.avatar) {
                        document.getElementById('avatar').value = user.avatar;
                    }
                    
                    if (user.bio) {
                        document.getElementById('bio').value = user.bio;
                    }
                    
                    // 编辑时密码字段不是必填
                    document.getElementById('password').required = false;
                    document.getElementById('password').placeholder = '留空表示不修改密码';
                } else {
                    showMessage(data.message, 'error');
                }
            })
            .catch(error => {
                hideLoading();
                showMessage('加载用户数据失败', 'error');
                console.error('Error:', error);
            });
    } else {
        // 创建用户
        modalTitle.textContent = '创建用户';
        document.getElementById('password').required = true;
        document.getElementById('password').placeholder = '';
    }
    
    // 显示模态框
    userModal.classList.add('show');
}

// 关闭用户模态框
function closeUserModal() {
    userModal.classList.remove('show');
}

// 打开删除确认模态框
function openDeleteModal(userId) {
    // 获取用户名
    const username = document.querySelector(`.btn-edit[data-id="${userId}"]`).closest('tr').querySelector('td:nth-child(2)').textContent;
    deleteUsernameSpan.textContent = username;
    
    // 设置用户ID
    document.getElementById('confirmDeleteBtn').setAttribute('data-user-id', userId);
    
    // 显示模态框
    deleteModal.classList.add('show');
}

// 关闭删除确认模态框
function closeDeleteModal() {
    deleteModal.classList.remove('show');
}

// 保存用户
function saveUser() {
    const userId = userIdInput.value;
    const isEdit = !!userId;
    
    // 获取表单数据
    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        status: parseInt(document.getElementById('status').value)
    };
    
    // 如果有密码，添加到表单数据
    const password = document.getElementById('password').value;
    if (password) {
        formData.password = password;
    }
    
    // 如果有头像，添加到表单数据
    const avatar = document.getElementById('avatar').value;
    if (avatar) {
        formData.avatar = avatar;
    }
    
    // 如果有个人简介，添加到表单数据
    const bio = document.getElementById('bio').value;
    if (bio) {
        formData.bio = bio;
    }
    
    // 发送请求
    showLoading();
    
    const url = isEdit ? `../api/users.php?id=${userId}` : '../api/users.php';
    const method = isEdit ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                showMessage(data.message, 'success');
                closeUserModal();
                loadUsers();
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            showMessage('保存用户失败', 'error');
            console.error('Error:', error);
        });
}

// 删除用户
function deleteUser(userId) {
    showLoading();
    
    fetch(`../api/users.php?id=${userId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                showMessage(data.message, 'success');
                closeDeleteModal();
                loadUsers();
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            showMessage('删除用户失败', 'error');
            console.error('Error:', error);
        });
}

// 显示加载指示器
function showLoading() {
    loadingIndicator.classList.add('show');
}

// 隐藏加载指示器
function hideLoading() {
    loadingIndicator.classList.remove('show');
}

// 显示消息
function showMessage(message, type = 'info') {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
} 