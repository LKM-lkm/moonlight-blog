// 导入样式
import '../css/login.css';

// 导入工具函数
import { showMessage, showLoading, hideLoading } from './utils.js';

// 初始化管理后台
document.addEventListener('DOMContentLoaded', () => {
    // 检查用户登录状态
    checkAuthStatus();
    
    // 绑定事件监听器
    bindEvents();
});

// 检查用户登录状态
async function checkAuthStatus() {
    try {
        const response = await fetch('/admin/api/auth/check.php');
        const data = await response.json();
        
        if (!data.success) {
            // 未登录，重定向到登录页面
            window.location.href = '/admin/login.html';
        }
    } catch (error) {
        console.error('检查登录状态失败:', error);
        showMessage('检查登录状态失败，请刷新页面重试', 'error');
    }
}

// 绑定事件监听器
function bindEvents() {
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 侧边栏切换
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
}

// 处理退出登录
async function handleLogout() {
    try {
        showLoading();
        
        const response = await fetch('/admin/api/auth/logout.php', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/admin/login.html';
        } else {
            showMessage(data.message || '退出失败，请重试', 'error');
        }
    } catch (error) {
        console.error('退出登录失败:', error);
        showMessage('退出登录失败，请重试', 'error');
    } finally {
        hideLoading();
    }
}

// 切换侧边栏
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    if (sidebar && content) {
        sidebar.classList.toggle('collapsed');
        content.classList.toggle('expanded');
    }
}

// 导出函数供其他模块使用
export {
    checkAuthStatus,
    handleLogout,
    toggleSidebar
}; 