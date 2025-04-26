// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
    console.log("初始化主题切换功能...");
    // 立即应用默认主题，以避免闪烁
    applyDefaultTheme();
    
    // 初始化按钮点击事件
    initThemeButton();
});

// 应用默认主题
function applyDefaultTheme() {
    var themeToggleBtn = document.getElementById('theme-toggle-btn');
    var body = document.body;
    
    if (!themeToggleBtn) {
        console.error("找不到主题切换按钮元素");
        return;
    }
    
    console.log("找到主题切换按钮:", themeToggleBtn);
    console.log("当前body类名:", body.className);
    
    var icon = themeToggleBtn.querySelector('i');
    if (!icon) {
        console.error("找不到主题切换按钮图标");
        return;
    }
    
    // 检查系统主题偏好
    var prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 检查本地存储中的主题设置
    var savedTheme = localStorage.getItem('theme');
    console.log("已保存的主题:", savedTheme);
    
    // 清除所有主题类，确保只应用一个
    body.classList.remove('theme-light', 'theme-dark');
    
    if (savedTheme === 'theme-dark') {
        // 应用暗色主题
        body.classList.add('theme-dark');
        icon.className = 'fas fa-sun';
        console.log("应用暗色主题 (来自保存的设置)");
    } else if (savedTheme === 'theme-light') {
        // 应用亮色主题
        body.classList.add('theme-light');
        icon.className = 'fas fa-moon';
        console.log("应用亮色主题 (来自保存的设置)");
    } else if (prefersDarkScheme.matches) {
        // 未保存首选项，但系统偏好暗色
        body.classList.add('theme-dark');
        icon.className = 'fas fa-sun';
        console.log("应用暗色主题 (来自系统偏好)");
    } else {
        // 默认亮色主题
        body.classList.add('theme-light');
        icon.className = 'fas fa-moon';
        console.log("应用亮色主题 (默认设置)");
    }
}

// 初始化主题切换按钮
function initThemeButton() {
    var themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (!themeToggleBtn) {
        console.error("无法初始化主题按钮 - 元素未找到");
        return;
    }
    
    // 监听系统主题变化
    var prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDarkScheme.addEventListener) {
        prefersDarkScheme.addEventListener('change', function(e) {
            if (!localStorage.getItem('theme')) {
                applyDefaultTheme();
            }
        });
    } else if (prefersDarkScheme.addListener) {
        // 兼容旧版API
        prefersDarkScheme.addListener(function(e) {
            if (!localStorage.getItem('theme')) {
                applyDefaultTheme();
            }
        });
    }
    
    // 切换主题 - 使用onclick
    themeToggleBtn.onclick = function(e) {
        e.preventDefault();
        toggleTheme();
        return false;
    };
    
    console.log("主题切换按钮事件已绑定");
}

// 切换主题
function toggleTheme() {
    var body = document.body;
    var themeToggleBtn = document.getElementById('theme-toggle-btn');
    var icon = themeToggleBtn.querySelector('i');
    
    console.log("切换主题，当前状态:", body.className);
    
    // 检查是否包含暗色主题类
    var isDarkTheme = body.classList.contains('theme-dark');
    
    // 清除现有主题类
    body.classList.remove('theme-light', 'theme-dark');
    
    if (isDarkTheme) {
        // 切换到亮色主题
        body.classList.add('theme-light');
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'theme-light');
        console.log("切换为亮色主题");
    } else {
        // 切换到暗色主题
        body.classList.add('theme-dark');
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'theme-dark');
        console.log("切换为暗色主题");
    }
}