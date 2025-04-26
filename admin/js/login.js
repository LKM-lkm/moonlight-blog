// 登录页面脚本
document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const rememberInput = document.querySelector('input[name="remember"]');
    const submitButton = document.querySelector('button[type="submit"]');
    const errorMessage = document.querySelector('.error-message');

    // 获取CSRF Token
    async function getCsrfToken() {
        try {
            const response = await fetch('/admin/api/auth/csrf.json.php', {
                method: 'GET',
                credentials: 'same-origin'
            });
            if (!response.ok) throw new Error('获取CSRF Token失败');
            const data = await response.json();
            return data.csrf_token;
        } catch (error) {
            console.error('CSRF Token获取失败:', error);
            showError('初始化失败，请刷新页面重试');
            return null;
        }
    }

    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = '登录';
    }

    // 清除错误信息
    function clearError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    // 处理登录请求
    async function handleLogin(formData) {
        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) return;

            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="loading-spinner"></span> 登录中...';

            const response = await fetch('/admin/api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    username: formData.get('username'),
                    password: formData.get('password'),
                    remember: formData.get('remember') === 'on',
                    csrf_token: csrfToken
                }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = '/admin/dashboard/';
            } else {
                showError(data.message || '登录失败，请重试');
            }
        } catch (error) {
            console.error('登录请求失败:', error);
            showError('网络错误，请稍后重试');
        }
    }

    // 表单提交事件
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();
        const formData = new FormData(loginForm);
        await handleLogin(formData);
    });

    // 输入框事件
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('input', clearError);
    });
}); 