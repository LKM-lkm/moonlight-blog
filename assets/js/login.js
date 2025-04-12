/**
 * 登录页面专用脚本
 * 处理用户登录、验证及错误信息显示
 */
// 添加安全检查，确保在HTTPS连接上
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    // 如果不是本地开发环境且不是HTTPS，则重定向到HTTPS
    window.location.href = window.location.href.replace('http:', 'https:');
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const errorMessageElement = document.getElementById('error-message');
    
    // 从localStorage加载记住的用户名（如果有）
    if (localStorage.getItem('rememberedUser')) {
        usernameInput.value = localStorage.getItem('rememberedUser');
        rememberCheckbox.checked = true;
    }
    
    // 检查是否已登录，如果已登录则重定向到管理页面
    if (localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
    }
    
    // 登录表单提交处理
    loginForm.addEventListener('submit', async function(e) {
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
        
        // 密码强度验证（移到服务端更好，这里只是前端简单检查）
        if (password.length < 8) {
            showError('密码必须至少包含8个字符');
            return;
        }
        
        // 显示加载状态
        const loginButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = loginButton.innerHTML;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
        loginButton.disabled = true;
        
        try {
            // 获取CSRF令牌 - 在实际应用中应当实现
            const csrfToken = 'csrf-token-placeholder';
            
            // 进行登录API请求
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
                credentials: 'include' // 重要：确保Cookie被发送和接收
            });
            
            const data = await response.json();
            
            // 如果登录成功
            if (response.ok && data.status === 'success') {
                // 如果勾选了"记住我"，保存用户名（但不保存密码）
                if (rememberCheckbox.checked) {
                    localStorage.setItem('rememberedUser', username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                
                // 设置登录状态，但不存储敏感信息
                localStorage.setItem('isLoggedIn', 'true');
                
                // 只存储非敏感信息
                if (data.data && data.data.user) {
                    localStorage.setItem('user', JSON.stringify({
                        username: data.data.user.username,
                        role: data.data.user.role
                    }));
                }
                
                // 重定向到管理页面
                window.location.href = 'index.html';
            } else {
                // 显示登录失败信息
                showError(data.message || '登录失败，请检查用户名和密码');
                
                // 恢复按钮状态
                loginButton.innerHTML = originalButtonText;
                loginButton.disabled = false;
            }
        } catch (error) {
            // 处理错误
            console.error('登录过程中发生错误:', error);
            showError('登录过程中发生错误，请稍后再试');
            
            // 恢复按钮状态
            loginButton.innerHTML = originalButtonText;
            loginButton.disabled = false;
        }
    });
    
    // 显示错误信息
    function showError(message) {
        errorMessageElement.textContent = message;
        // 轻微震动效果提示用户
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
    }
    
    // 添加表单错误提示的CSS动画
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