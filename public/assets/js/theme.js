// 主题管理
class ThemeManager {
    constructor() {
        this.themeKey = 'moonlight_theme';
        this.defaultTheme = 'light';
        this.themes = ['light', 'dark', 'auto'];
        this.init();
    }

    init() {
        // 初始化主题
        const savedTheme = localStorage.getItem(this.themeKey) || 'auto';
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
            const currentTheme = localStorage.getItem(this.themeKey);
            if (currentTheme === 'auto') {
                this.applyTheme('auto');
            }
        });
    }

    bindThemeToggle() {
        const toggleButtons = document.querySelectorAll('.theme-toggle, #theme-toggle-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const currentTheme = localStorage.getItem(this.themeKey) || 'auto';
                let newTheme;
                
                if (currentTheme === 'auto') {
                    newTheme = 'dark';
                } else if (currentTheme === 'dark') {
                    newTheme = 'light';
                } else {
                    newTheme = 'auto';
                }
                
                this.applyTheme(newTheme);
                localStorage.setItem(this.themeKey, newTheme);
            });
        });
    }

    applyTheme(theme) {
        // 确定实际应用的主题
        const actualTheme = theme === 'auto' ? this.getSystemTheme() : theme;
        
        // 应用主题到HTML元素
        document.documentElement.setAttribute('data-theme', actualTheme);
        
        // 更新主题图标
        const toggleButtons = document.querySelectorAll('.theme-toggle, #theme-toggle-btn');
        toggleButtons.forEach(button => {
            const icon = button.querySelector('i') || button;
            if (theme === 'auto') {
                icon.className = 'fas fa-adjust';
                button.title = '跟随系统';
            } else if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                button.title = '切换到亮色模式';
            } else {
                icon.className = 'fas fa-moon';
                button.title = '切换到暗色模式';
            }
        });

        // 触发主题变化事件
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { 
                theme: actualTheme,
                preference: theme
            } 
        }));
    }
}

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
}); 