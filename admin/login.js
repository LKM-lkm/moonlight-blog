/**
 * 后台登录页面 - 主入口文件
 */

// 导入样式
import '../assets/css/style.css';
import '../assets/css/login.css';

// 登录页面初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('登录页面已加载');
    
    // 初始化主题
    initTheme();
    
    // 初始化登录功能
    initLogin();
});

// 初始化主题
function initTheme() {
    // 检查本地存储的主题设置
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = `login-page theme-${savedTheme}`;
}

// 初始化登录功能
function initLogin() {
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');
    
    // 新密码的 SHA-256 哈希（小写十六进制）
    const PASSWORD_HASH = '2020b3258cb31725edbdad976f82def0a5e38b24a23d8ba11a11484257cc9944';
    const SESSION_KEY = 'ml_admin_logged_in';
    
    // SHA-256 哈希函数
    async function sha256(str) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // 登录校验
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const pwd = passwordInput.value;
        errorMsg.textContent = '';
        
        if (!pwd) {
            errorMsg.textContent = '请输入密码';
            return;
        }
        
        try {
            const hash = await sha256(pwd);
            if (hash === PASSWORD_HASH) {
                sessionStorage.setItem(SESSION_KEY, '1');
                window.location.href = 'views/articles.html';
            } else {
                errorMsg.textContent = '密码错误，请重试';
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error('登录验证失败:', error);
            errorMsg.textContent = '登录失败，请重试';
        }
    });
    
    // 已登录自动跳转
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
        window.location.href = 'views/articles.html';
    }
    
    // 密码输入框焦点处理
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
} 