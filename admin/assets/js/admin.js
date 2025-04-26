/**
 * 管理后台主要JavaScript文件
 */

// 导入样式
import '../css/login.css';

// 导入工具函数
import { showMessage, showLoading, hideLoading } from './utils.js';

// 初始化管理后台
document.addEventListener('DOMContentLoaded', async () => {
    // 检查登录状态
    const isLoggedIn = await checkAuthStatus();
    if (!isLoggedIn) return;
    
    // 初始化各个模块
    initSidebar();
    initUserMenu();
    
    // 绑定退出登录事件
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

// 检查用户登录状态
async function checkAuthStatus() {
    try {
        const response = await fetch('/admin/api/auth/check.php');
        const data = await response.json();
        
        if (!data.success) {
            window.location.href = '/admin/login/';
            return false;
        }
        return true;
    } catch (error) {
        console.error('检查登录状态失败:', error);
        showMessage('检查登录状态失败，请刷新页面重试', 'error');
        return false;
    }
}

// 显示消息提示
function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            messageElement.remove();
        }, 300);
    }, 3000);
}

// 初始化侧边栏
function initSidebar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-collapsed');
        });
    }
}

// 初始化用户菜单
function initUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', () => {
            userMenu.classList.toggle('active');
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
    }
}

// 处理退出登录
async function handleLogout() {
    try {
        const response = await fetch('/admin/api/auth/logout.php', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        if (data.success) {
            window.location.href = '/admin/login/';
        } else {
            showMessage(data.message || '退出失败，请重试', 'error');
        }
    } catch (error) {
        console.error('退出登录失败:', error);
        showMessage('退出登录失败，请重试', 'error');
    }
}

// 导出函数供其他模块使用
export {
    checkAuthStatus,
    handleLogout,
    initSidebar,
    initUserMenu
}; 