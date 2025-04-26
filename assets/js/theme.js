// 主题管理
class ThemeManager {
    constructor() {
        this.themeKey = 'moonlight_theme';
        this.defaultTheme = 'light';
        this.themes = ['light', 'dark'];
        this.init();
    }

    init() {
        // 初始化主题
        const savedTheme = localStorage.getItem(this.themeKey) || this.getSystemTheme();
        this.applyTheme(savedTheme);

        // 监听系统主题变化
        this.watchSystemTheme();

        // 绑定主题切换按钮
        this.bindThemeToggle();
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    watchSystemTheme() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.themeKey)) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    bindThemeToggle() {
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.applyTheme(newTheme);
                localStorage.setItem(this.themeKey, newTheme);
            });
        }
    }

    applyTheme(theme) {
        // 应用主题到HTML元素
        document.documentElement.setAttribute('data-theme', theme);
        
        // 更新主题图标
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            const icon = toggleButton.querySelector('i') || toggleButton;
            icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            toggleButton.title = theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式';
        }

        // 触发主题变化事件
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }
}

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
}); 