// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;
    const icon = themeToggleBtn.querySelector('i');
    
    // 检查系统主题偏好
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.className = savedTheme;
        icon.className = savedTheme === 'theme-dark' ? 'fas fa-sun' : 'fas fa-moon';
    } else if (prefersDarkScheme.matches) {
        body.className = 'theme-dark';
        icon.className = 'fas fa-sun';
    }
    
    // 监听系统主题变化
    prefersDarkScheme.addListener((e) => {
        if (!localStorage.getItem('theme')) {
            body.className = e.matches ? 'theme-dark' : 'theme-light';
            icon.className = e.matches ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
    
    // 切换主题
    themeToggleBtn.addEventListener('click', () => {
        if (body.className === 'theme-dark') {
            body.className = 'theme-light';
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'theme-light');
        } else {
            body.className = 'theme-dark';
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'theme-dark');
        }
    });
});