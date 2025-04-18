document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const captchaImage = document.getElementById('captchaImage');
    const rememberMe = document.getElementById('rememberMe');
    
    // 检查是否有保存的用户名
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        rememberMe.checked = true;
    }
    
    // 加载验证码
    function loadCaptcha() {
        captchaImage.src = `/api/auth/captcha?t=${new Date().getTime()}`;
    }
    
    // 初始加载验证码
    loadCaptcha();
    
    // 点击验证码图片刷新
    captchaImage.addEventListener('click', loadCaptcha);
    
    // 表单提交处理
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const captcha = document.getElementById('captcha').value.trim();
        
        // 基本验证
        if (!username || !password || !captcha) {
            showError('请填写所有必填字段');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    captcha
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 如果选择了"记住我"，保存用户名
                if (rememberMe.checked) {
                    localStorage.setItem('rememberedUsername', username);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }
                
                // 保存token
                localStorage.setItem('token', data.token);
                
                // 跳转到管理面板
                window.location.href = '/admin/dashboard.html';
            } else {
                showError(data.message || '登录失败');
                loadCaptcha(); // 刷新验证码
                document.getElementById('captcha').value = ''; // 清空验证码输入
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('登录过程中发生错误，请稍后重试');
            loadCaptcha();
        }
    });
    
    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        // 3秒后自动隐藏错误信息
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
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
    });
}); 