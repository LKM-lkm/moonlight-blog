// 主题切换器 - 修复版本
// 支持本地存储，自动切换深浅色，包含图标更新
// 统一主题管理器 - 月光云海博客系统
class UnifiedThemeManager {
  constructor() {
    this.themeKey = 'moonlight_theme';
    this.themes = ['light', 'dark', 'auto'];
    this.currentTheme = 'auto';
    this.init();
  }

  init() {
    // 获取保存的主题偏好
    const savedTheme = localStorage.getItem(this.themeKey) || 'auto';
    this.currentTheme = savedTheme;
    
    this.applyTheme(savedTheme);
    this.bindToggleButtons();
    this.watchSystemTheme();
    
    console.log('统一主题管理器已初始化');
  }

  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  getActualTheme(theme) {
    return theme === 'auto' ? this.getSystemTheme() : theme;
  }

  applyTheme(theme) {
    const actualTheme = this.getActualTheme(theme);
    
    // 应用到HTML元素
    const html = document.documentElement;
    const body = document.body;
    
    // 清除旧的主题类
    html.classList.remove('theme-light', 'theme-dark');
    body.classList.remove('theme-light', 'theme-dark');
    html.removeAttribute('data-theme');
    
    // 应用新主题
    html.classList.add(`theme-${actualTheme}`);
    body.classList.add(`theme-${actualTheme}`);
    html.setAttribute('data-theme', actualTheme);
    
    // 更新按钮图标
    this.updateToggleIcons(theme);
    
    // 保存偏好
    localStorage.setItem(this.themeKey, theme);
    this.currentTheme = theme;
    
    // 触发主题变化事件
    this.dispatchThemeEvent(actualTheme, theme);
    
    console.log(`主题已应用: ${theme} (实际: ${actualTheme})`);
  }

  updateToggleIcons(theme) {
    const toggleButtons = document.querySelectorAll('.theme-toggle, #theme-toggle-btn, [data-theme-toggle]');
    
    toggleButtons.forEach(button => {
      const icon = button.querySelector('i') || button;
      
      // 更新图标和提示文字
      if (theme === 'auto') {
        if (icon.tagName === 'I') {
          icon.className = 'fas fa-adjust';
        }
        button.title = '跟随系统主题';
      } else if (theme === 'dark') {
        if (icon.tagName === 'I') {
          icon.className = 'fas fa-sun';
        }
        button.title = '切换到亮色模式';
      } else {
        if (icon.tagName === 'I') {
          icon.className = 'fas fa-moon';
        }
        button.title = '切换到暗色模式';
      }
    });
  }

  bindToggleButtons() {
    const toggleButtons = document.querySelectorAll('.theme-toggle, #theme-toggle-btn, [data-theme-toggle]');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
    });
    
    if (toggleButtons.length === 0) {
      console.warn('未找到主题切换按钮');
    } else {
      console.log(`已绑定 ${toggleButtons.length} 个主题切换按钮`);
    }
  }

  toggleTheme() {
    let newTheme;
    
    // 循环切换: auto -> light -> dark -> auto
    switch (this.currentTheme) {
      case 'auto':
        newTheme = 'light';
        break;
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'auto';
        break;
      default:
        newTheme = 'auto';
    }
    
    this.applyTheme(newTheme);
  }

  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', () => {
      // 只有在auto模式下才响应系统主题变化
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto');
      }
    });
  }

  dispatchThemeEvent(actualTheme, preference) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme: actualTheme,
        preference: preference,
        timestamp: Date.now()
      }
    });
    
    window.dispatchEvent(event);
  }

  // 公共API
  setTheme(theme) {
    if (this.themes.includes(theme)) {
      this.applyTheme(theme);
    } else {
      console.warn(`无效的主题: ${theme}`);
    }
  }

  getCurrentTheme() {
    return {
      preference: this.currentTheme,
      actual: this.getActualTheme(this.currentTheme)
    };
  }
}

// 全局初始化
document.addEventListener('DOMContentLoaded', function () {
  // 确保只初始化一次
  if (!window.unifiedThemeManager) {
    window.unifiedThemeManager = new UnifiedThemeManager();
    
    // 兼容性别名
    window.themeSwitcher = window.unifiedThemeManager;
    window.themeManager = window.unifiedThemeManager;
  }
});