document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const captchaImage = document.getElementById('captchaImage');
    const rememberMe = document.getElementById('rememberMe');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const captchaInput = document.getElementById('captcha');
    
    // 防止表单重复提交
    let isSubmitting = false;
    
    // 登录尝试次数限制
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_TIME = 15 * 60 * 1000; // 15分钟
    let loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    let lastAttemptTime = parseInt(localStorage.getItem('lastAttemptTime') || '0');
    
    // 检查是否被锁定
    function checkLockout() {
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            const timeElapsed = Date.now() - lastAttemptTime;
            if (timeElapsed < LOCKOUT_TIME) {
                const minutesLeft = Math.ceil((LOCKOUT_TIME - timeElapsed) / 60000);
                showError(`由于多次登录失败，账户已被锁定。请在${minutesLeft}分钟后重试。`);
                return true;
            } else {
                // 锁定时间已过，重置计数
                resetLoginAttempts();
            }
        }
        return false;
    }
    
    // 重置登录尝试次数
    function resetLoginAttempts() {
        loginAttempts = 0;
        localStorage.setItem('loginAttempts', '0');
        localStorage.removeItem('lastAttemptTime');
    }
    
    // 增加登录尝试次数
    function incrementLoginAttempts() {
        loginAttempts++;
        localStorage.setItem('loginAttempts', loginAttempts.toString());
        localStorage.setItem('lastAttemptTime', Date.now().toString());
    }
    
    // 检查是否有保存的用户名
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
        usernameInput.value = savedUsername;
        rememberMe.checked = true;
    }
    
    // 加载验证码
    function loadCaptcha() {
        const timestamp = new Date().getTime();
        captchaImage.src = `/api/auth/captcha?t=${timestamp}`;
        captchaInput.value = '';
    }
    
    // 初始加载验证码
    loadCaptcha();
    
    // 点击验证码图片刷新
    captchaImage.addEventListener('click', loadCaptcha);
    
    // 密码强度检查
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strengthMeter = document.createElement('div');
        strengthMeter.className = 'password-strength';
        
        let strength = 0;
        let feedback = '';
        
        // 检查密码长度
        if (password.length >= 8) strength++;
        // 检查是否包含数字
        if (/\d/.test(password)) strength++;
        // 检查是否包含小写字母
        if (/[a-z]/.test(password)) strength++;
        // 检查是否包含大写字母
        if (/[A-Z]/.test(password)) strength++;
        // 检查是否包含特殊字符
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        switch (strength) {
            case 0:
            case 1:
                feedback = '密码强度：弱';
                strengthMeter.style.backgroundColor = '#ff4d4d';
                break;
            case 2:
            case 3:
                feedback = '密码强度：中';
                strengthMeter.style.backgroundColor = '#ffd700';
                break;
            case 4:
            case 5:
                feedback = '密码强度：强';
                strengthMeter.style.backgroundColor = '#00cc00';
                break;
        }
        
        strengthMeter.style.width = `${(strength / 5) * 100}%`;
        strengthMeter.setAttribute('data-strength', feedback);
        
        // 更新或添加强度指示器
        const existingMeter = passwordInput.parentElement.querySelector('.password-strength');
        if (existingMeter) {
            existingMeter.replaceWith(strengthMeter);
        } else {
            passwordInput.parentElement.appendChild(strengthMeter);
        }
    });
    
    // 表单提交处理
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        if (checkLockout()) return;
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const captcha = captchaInput.value.trim();
        
        // 基本验证
        if (!username || !password || !captcha) {
            showError('请填写所有必填字段');
            return;
        }
        
        try {
            isSubmitting = true;
            const loginButton = document.querySelector('.login-button');
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> 登录中...';
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    username,
                    password,
                    captcha
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 登录成功，重置尝试次数
                resetLoginAttempts();
                
                // 处理"记住我"
                if (rememberMe.checked) {
                    localStorage.setItem('rememberedUsername', username);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }
                
                // 保存token和用户信息
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // 显示成功消息并跳转
                showSuccess('登录成功，正在跳转...');
                setTimeout(() => {
                    window.location.href = '/admin/dashboard.html';
                }, 1000);
            } else {
                incrementLoginAttempts();
                showError(data.message || '登录失败');
                loadCaptcha();
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('登录过程中发生错误，请稍后重试');
            loadCaptcha();
        } finally {
            isSubmitting = false;
            const loginButton = document.querySelector('.login-button');
            loginButton.disabled = false;
            loginButton.innerHTML = '<span>登录</span><i class="fas fa-arrow-right"></i>';
        }
    });
    
    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'error-message show error';
        
        // 3秒后自动隐藏错误信息
        setTimeout(() => {
            errorMessage.className = 'error-message';
        }, 3000);
    }
    
    // 显示成功信息
    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'error-message show success';
    }
    
    // 输入框焦点效果
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // 添加输入验证
        input.addEventListener('input', () => {
            if (input.value.trim()) {
                input.classList.remove('invalid');
            }
        });
    });
    
    // 防止在密码输入框使用剪切板
    passwordInput.addEventListener('copy', e => e.preventDefault());
    passwordInput.addEventListener('cut', e => e.preventDefault());
    passwordInput.addEventListener('paste', e => e.preventDefault());
    
    // 添加自动超时登出
    let inactivityTimeout;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
        }, 30 * 60 * 1000); // 30分钟无操作自动登出
    }
    
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
}); 