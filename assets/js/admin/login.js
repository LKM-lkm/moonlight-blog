document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const rememberMe = document.getElementById('remember');
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

    // 检查是否有保存的用户名
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        rememberMe.checked = true;
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

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 获取表单数据
        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value.trim();
        const captcha = document.getElementById('captcha').value.trim();

        // 表单验证
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
            // 发送登录请求
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 登录成功，重置登录尝试次数
                loginAttempts = 0;
                localStorage.removeItem('loginAttempts');
                localStorage.removeItem('lockoutEndTime');

                // 登录成功
                if (rememberMe.checked) {
                    localStorage.setItem('username', username);
                } else {
                    localStorage.removeItem('username');
                }

                // 保存token
                localStorage.setItem('token', data.token);
                
                // 跳转到管理面板
                window.location.href = '/admin/dashboard.html';
            } else {
                // 登录失败
                loginAttempts++;
                localStorage.setItem('loginAttempts', loginAttempts.toString());

                if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                    const lockoutEndTime = Date.now() + LOCKOUT_TIME;
                    localStorage.setItem('lockoutEndTime', lockoutEndTime.toString());
                    showError(`登录尝试次数过多，账户已被锁定30分钟`);
                    disableLoginForm();
                } else {
                    showError(`登录失败，还剩${MAX_LOGIN_ATTEMPTS - loginAttempts}次尝试机会`);
                }
                
                currentCaptcha = generateCaptcha();
            }
        } catch (error) {
            showError('网络错误，请稍后重试');
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
        errorMessage.style.display = 'block';
        errorMessage.style.opacity = '1';
        
        // 3秒后淡出错误信息
        setTimeout(() => {
            errorMessage.style.opacity = '0';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 300);
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
        const token = localStorage.getItem('token');
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
                    localStorage.removeItem('token');
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
            });
        }
    }
}); 