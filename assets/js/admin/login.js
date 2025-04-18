document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const rememberCheckbox = document.getElementById('remember');
    const passwordInput = document.getElementById('password');
    const captchaContainer = document.createElement('div');
    captchaContainer.className = 'captcha-container';
    
    // 登录尝试次数
    let loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_TIME = 30 * 60 * 1000; // 30分钟

    // 检查是否处于锁定状态
    const lockoutEndTime = localStorage.getItem('lockoutEndTime');
    if (lockoutEndTime && Date.now() < parseInt(lockoutEndTime)) {
        const remainingTime = Math.ceil((parseInt(lockoutEndTime) - Date.now()) / 1000 / 60);
        showError(`账户已被锁定，请${remainingTime}分钟后再试`);
        disableLoginForm();
        return;
    }

    // 检查登录状态
    checkLoginStatus();

    // 检查是否有保存的登录信息
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
    if (savedUsername && savedPassword) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
        rememberCheckbox.checked = true;
    }

    // 创建验证码输入框
    const captchaInput = document.createElement('input');
    captchaInput.type = 'text';
    captchaInput.id = 'captcha';
    captchaInput.placeholder = '请输入验证码';
    captchaInput.className = 'form-control';
    
    const captchaImage = document.createElement('img');
    captchaImage.id = 'captchaImage';
    captchaImage.alt = '验证码';
    
    captchaContainer.appendChild(captchaImage);
    captchaContainer.appendChild(captchaInput);
    
    // 在密码输入框后插入验证码
    passwordInput.parentNode.parentNode.insertBefore(captchaContainer, passwordInput.parentNode.nextSibling);

    // 生成验证码
    function generateCaptcha() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 40;
        
        // 生成随机验证码
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let captchaText = '';
        for (let i = 0; i < 4; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // 绘制背景
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制文字
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(captchaText, canvas.width/2, canvas.height/2);
        
        // 添加干扰线
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.strokeStyle = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
            ctx.stroke();
        }
        
        captchaImage.src = canvas.toDataURL();
        return captchaText;
    }

    let currentCaptcha = generateCaptcha();

    // 点击验证码图片刷新
    captchaImage.addEventListener('click', () => {
        currentCaptcha = generateCaptcha();
    });

    // 密码强度检查
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
    });

    // 表单提交处理
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const captcha = document.getElementById('captcha').value.trim();
        
        // 基本验证
        if (!username || !password || !captcha) {
            showError('请填写所有必填项');
            return;
        }

        // 验证码验证
        if (captcha.toLowerCase() !== currentCaptcha.toLowerCase()) {
            showError('验证码错误');
            currentCaptcha = generateCaptcha();
            return;
        }

        // 密码强度验证
        if (checkPasswordStrength(password) < 2) {
            showError('密码强度不足，请使用更复杂的密码');
            return;
        }

        try {
            // 这里替换为实际的登录API调用
            const response = await login(username, password);
            
            if (response.success) {
                // 如果选择"记住我"，保存登录信息
                if (rememberCheckbox.checked) {
                    localStorage.setItem('username', username);
                    localStorage.setItem('password', password);
                } else {
                    localStorage.removeItem('username');
                    localStorage.removeItem('password');
                }

                // 保存登录状态
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userToken', response.token);
                
                // 跳转到管理面板
                window.location.href = 'dashboard.html';
            } else {
                showError(response.message || '登录失败，请检查用户名和密码');
            }
        } catch (error) {
            showError('登录过程中发生错误，请稍后重试');
            console.error('Login error:', error);
        }
    });

    // 禁用登录表单
    function disableLoginForm() {
        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => input.disabled = true);
        loginForm.querySelector('button').disabled = true;
    }

    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.opacity = '1';
        
        // 3秒后自动隐藏错误信息
        setTimeout(() => {
            errorMessage.style.opacity = '0';
        }, 3000);
    }

    // 输入框获得焦点时隐藏错误信息
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            errorMessage.style.display = 'none';
        });
    });

    // 检查密码强度
    function checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]+/)) strength++;
        if (password.match(/[A-Z]+/)) strength++;
        if (password.match(/[0-9]+/)) strength++;
        if (password.match(/[^a-zA-Z0-9]+/)) strength++;
        return strength;
    }

    // 更新密码强度指示器
    function updatePasswordStrengthIndicator(strength) {
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        strengthIndicator.style.display = 'none';
        
        const existingIndicator = document.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (passwordInput.value) {
            strengthIndicator.style.display = 'block';
            let strengthText = '';
            let strengthColor = '';

            switch(strength) {
                case 0:
                case 1:
                    strengthText = '弱';
                    strengthColor = '#ff4444';
                    break;
                case 2:
                case 3:
                    strengthText = '中';
                    strengthColor = '#ffbb33';
                    break;
                case 4:
                case 5:
                    strengthText = '强';
                    strengthColor = '#00C851';
                    break;
            }

            strengthIndicator.textContent = `密码强度: ${strengthText}`;
            strengthIndicator.style.color = strengthColor;
            passwordInput.parentNode.appendChild(strengthIndicator);
        }
    }

    // 检查登录状态
    function checkLoginStatus() {
        const token = localStorage.getItem('userToken');
        if (token) {
            // 验证token有效性
            fetch('/api/verify-token', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.ok) {
                    // token有效，直接跳转到管理面板
                    window.location.href = '/admin/dashboard.html';
                } else {
                    // token无效，清除token
                    localStorage.removeItem('userToken');
                }
            })
            .catch(() => {
                localStorage.removeItem('userToken');
            });
        }
    }

    // 模拟登录API调用
    async function login(username, password) {
        // 这里替换为实际的API调用
        return new Promise((resolve) => {
            setTimeout(() => {
                // 示例：简单的用户名密码验证
                if (username === 'admin' && password === 'admin123') {
                    resolve({
                        success: true,
                        token: 'dummy-token-' + Date.now()
                    });
                } else {
                    resolve({
                        success: false,
                        message: '用户名或密码错误'
                    });
                }
            }, 1000);
        });
    }
}); 