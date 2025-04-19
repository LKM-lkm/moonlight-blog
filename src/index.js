// 月光云海博客 - 主入口文件
console.log('月光云海博客已加载');

// 导入全局样式
import '../assets/css/style.css';
import '../admin/assets/css/login.css';

// 导入功能模块
import '../admin/assets/js/login.js';
import '../assets/js/chatbot.js';

// 导入工具函数
import { showMessage, showLoading, hideLoading } from '../admin/assets/js/utils.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否在管理后台
    if (window.location.pathname.startsWith('/admin')) {
        // 检查用户登录状态
        checkAuthStatus();
    }
    
    // 绑定事件监听器
    bindEvents();
});

// 检查用户登录状态
async function checkAuthStatus() {
    try {
        const response = await fetch('/admin/api/auth/check.php');
        const data = await response.json();
        
        if (!data.success && !window.location.pathname.includes('login.html')) {
            // 未登录且不在登录页面，重定向到登录页面
            window.location.href = '/admin/login.html';
        }
    } catch (error) {
        console.error('检查登录状态失败:', error);
        showMessage('检查登录状态失败，请刷新页面重试', 'error');
    }
}

// 绑定事件监听器
function bindEvents() {
    // 登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    try {
        showLoading();
        
        const response = await fetch('/admin/api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                remember
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/admin/dashboard';
        } else {
            showMessage(data.message || '登录失败，请检查用户名和密码', 'error');
        }
    } catch (error) {
        console.error('登录错误:', error);
        showMessage('登录过程中发生错误，请稍后重试', 'error');
    } finally {
        hideLoading();
    }
}

// 这里可以添加其他导入和初始化代码 