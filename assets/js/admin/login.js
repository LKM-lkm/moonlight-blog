document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const rememberCheckbox = document.getElementById('remember');

    // 检查是否有保存的登录信息
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        rememberCheckbox.checked = true;
    }

    // 表单提交处理
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // 基本验证
        if (!username || !password) {
            showError('请填写用户名和密码');
            return;
        }

        try {
            // 这里替换为实际的登录API调用
            const response = await login(username, password);
            
            if (response.success) {
                // 如果选择"记住我"，保存登录信息
                if (rememberCheckbox.checked) {
                    localStorage.setItem('username', username);
                } else {
                    localStorage.removeItem('username');
                }

                // 保存登录状态
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userToken', response.token);
                
                // 跳转到管理面板
                window.location.href = 'index.html';
            } else {
                showError(response.message || '登录失败，请检查用户名和密码');
            }
        } catch (error) {
            showError('登录过程中发生错误，请稍后重试');
            console.error('Login error:', error);
        }
    });

    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.opacity = '1';
        
        // 3秒后自动隐藏错误信息
        setTimeout(() => {
            errorMessage.style.opacity = '0';
        }, 3000);
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
            }, 500);
        });
    }
}); 