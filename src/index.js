// 月光云海博客 - 主入口文件
console.log('月光云海博客已加载');

// 导入全局样式
import '../assets/css/style.css';
// import '../admin/assets/css/login.css'; // 主页不需要登录页样式

// 导入功能模块
// import '../admin/assets/js/login.js'; // 主页不需要登录逻辑
import '../assets/js/chatbot.js';
import '../assets/js/theme-switcher.js'; // <--- 添加主题切换器导入

// 导入工具函数
// import { showMessage, showLoading, hideLoading } from '../admin/assets/js/utils.js'; // 主页暂时用不到这些

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 移除特定于管理后台的逻辑
    // if (window.location.pathname.startsWith('/admin')) {
    //     checkAuthStatus();
    // }
    
    // 绑定事件监听器 (保留可能有用的公共绑定逻辑，或移除)
    bindEvents(); 
});

// 移除或注释掉特定于管理后台的函数
// async function checkAuthStatus() { ... }
// function bindEvents() { ... }
// async function handleLogin(e) { ... }

// 这里可以添加其他导入和初始化代码 