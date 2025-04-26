// 主题切换功能
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 初始化主题
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        } else {
            const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', systemTheme);
            updateThemeIcon(systemTheme);
        }
    }
    
    // 更新主题图标
    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        
        const moonIcon = '🌙';
        const sunIcon = '☀️';
        themeToggle.textContent = theme === 'dark' ? moonIcon : sunIcon;
        themeToggle.setAttribute('title', theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式');
    }
    
    // 切换主题
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // 添加切换动画
        document.documentElement.style.transition = 'all 0.3s ease-in-out';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }
    
    // 监听系统主题变化
    prefersDarkScheme.addListener((e) => {
        if (!localStorage.getItem('theme')) {
            const systemTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', systemTheme);
            updateThemeIcon(systemTheme);
        }
    });
    
    // 绑定点击事件
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // 初始化主题
    initTheme();
}); 