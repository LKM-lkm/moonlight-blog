/**
 * 登录页面专用脚本
 * 处理用户登录、验证及错误信息显示
 */
// 安全检查，确保在HTTPS连接上
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    // 如果不是本地开发环境且不是HTTPS，则重定向到HTTPS
    window.location.href = window.location.href.replace('http:', 'https:');
}

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const errorMessageElement = document.getElementById('error-message');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // 主题设置
    initTheme();
    
    // 从localStorage加载记住的用户名
    if (localStorage.getItem('rememberedUser')) {
        usernameInput.value = localStorage.getItem('rememberedUser');
        rememberCheckbox.checked = true;
    }
    
    // 检查是否已登录
    if (localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
    }
    
    // 登录表单提交处理
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 清除之前的错误信息
        errorMessageElement.textContent = '';
        
        // 获取输入值
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // 基本验证
        if (!username || !password) {
            showError('请填写用户名和密码');
            return;
        }
        
        // 显示加载状态
        const loginButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = loginButton.innerHTML;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
        loginButton.disabled = true;
        
        // 直接客户端验证，硬编码的用户名和密码
        if (username === 'Likem' && password === 'Lkm76@#21') {
            // 登录成功处理
            if (rememberCheckbox.checked) {
                localStorage.setItem('rememberedUser', username);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            
            // 设置登录状态
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify({
                username: username,
                role: 'admin'
            }));
            
            // 保存当前主题设置
            const isDarkTheme = document.body.classList.contains('dark-theme') || 
                              (!document.body.classList.contains('light-theme') && 
                               window.matchMedia('(prefers-color-scheme: dark)').matches);
            localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
            
            // 重定向到管理页面
            window.location.href = 'index.html';
        } else {
            // 登录失败
            setTimeout(() => {
                showError('用户名或密码错误');
                loginButton.innerHTML = originalButtonText;
                loginButton.disabled = false;
            }, 1000);
        }
    });
    
    // 主题切换事件监听
    themeToggle.addEventListener('click', function() {
        toggleTheme();
    });
    
    // 显示错误信息函数
    function showError(message) {
        errorMessageElement.textContent = message;
        // 震动效果
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
    }
    
    // 初始化主题
    function initTheme() {
        // 检查本地存储的主题设置
        const savedTheme = localStorage.getItem('theme');
        
        // 检查系统主题
        const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // 根据存储的主题或系统主题设置当前主题
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else if (savedTheme === 'dark' || prefersDarkTheme) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
    
    // 切换主题
    function toggleTheme() {
        if (document.body.classList.contains('dark-theme') || 
            (!document.body.classList.contains('light-theme') && 
             window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            // 当前是暗色主题，切换到亮色
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            // 当前是亮色主题，切换到暗色
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // 添加shake动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
    `;
    document.head.appendChild(style);
    
    // 按下回车键时提交表单
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
            const loginButton = loginForm.querySelector('button[type="submit"]');
            if (!loginButton.disabled) {
                loginButton.click();
            }
        }
    });
    
    // 处理页面可见性变化，提高安全性
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            // 如果用户切换到其他标签/窗口，记录时间
            sessionStorage.setItem('lastHiddenTime', Date.now());
        } else if (document.visibilityState === 'visible') {
            // 如果用户返回，检查超时
            const lastHiddenTime = parseInt(sessionStorage.getItem('lastHiddenTime') || '0');
            // 如果用户离开超过10分钟，清除表单
            if (Date.now() - lastHiddenTime > 10 * 60 * 1000) {
                passwordInput.value = '';
            }
        }
    });
}); 