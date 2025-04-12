// 主题切换功能

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const icon = themeToggleBtn.querySelector('i');
    
    // 检查系统主题偏好
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 检查本地存储中是否有用户的主题偏好
    const savedTheme = localStorage.getItem('theme');
    
    // 设置初始主题
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme === 'dark');
    } else {
        // 如果没有保存的偏好，使用系统主题
        const isDarkMode = prefersDarkScheme.matches;
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        updateIcon(isDarkMode);
    }
    
    // 监听主题切换按钮点击
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateIcon(newTheme === 'dark');
    });
    
    // 监听系统主题变化
    prefersDarkScheme.addEventListener('change', (e) => {
        // 只有在没有用户设置的情况下才跟随系统
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            updateIcon(e.matches);
        }
    });
    
    // 更新图标
    function updateIcon(isDark) {
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
});