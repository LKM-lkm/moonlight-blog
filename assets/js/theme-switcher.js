// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
    console.log("初始化主题切换功能...");
    var themeToggleBtn = document.getElementById('theme-toggle-btn');
    var body = document.body;
    
    if (!themeToggleBtn) {
        console.error("找不到主题切换按钮元素");
        return;
    }
    
    console.log("找到主题切换按钮:", themeToggleBtn);
    console.log("当前body类名:", body.className);
    
    var icon = themeToggleBtn.querySelector('i');
    
    // 检查系统主题偏好
    var prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 检查本地存储中的主题设置
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        // 保留其他类名，只替换主题相关类名
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        body.classList.add(savedTheme);
        icon.className = savedTheme === 'theme-dark' ? 'fas fa-sun' : 'fas fa-moon';
        console.log("应用已保存的主题:", savedTheme);
    } else {
        // 默认应用亮色主题，除非系统偏好是暗色
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        if (prefersDarkScheme.matches) {
            body.classList.add('theme-dark');
            icon.className = 'fas fa-sun';
            console.log("应用系统偏好的暗色主题");
        } else {
            body.classList.add('theme-light');
            icon.className = 'fas fa-moon';
            console.log("应用默认的亮色主题");
        }
    }
    
    // 监听系统主题变化
    if (prefersDarkScheme.addEventListener) {
        prefersDarkScheme.addEventListener('change', function(e) {
            if (!localStorage.getItem('theme')) {
                body.classList.remove('theme-light', 'theme-dark');
                body.classList.add(e.matches ? 'theme-dark' : 'theme-light');
                icon.className = e.matches ? 'fas fa-sun' : 'fas fa-moon';
                console.log("系统主题变化为:", e.matches ? '暗色' : '亮色');
            }
        });
    } else {
        // 兼容旧版API
        prefersDarkScheme.addListener(function(e) {
            if (!localStorage.getItem('theme')) {
                body.classList.remove('theme-light', 'theme-dark');
                body.classList.add(e.matches ? 'theme-dark' : 'theme-light');
                icon.className = e.matches ? 'fas fa-sun' : 'fas fa-moon';
                console.log("系统主题变化为:", e.matches ? '暗色' : '亮色');
            }
        });
    }
    
    // 切换主题 - 使用onclick而非addEventListener
    themeToggleBtn.onclick = function(e) {
        console.log("点击主题切换按钮");
        e.preventDefault();
        
        // 检查是否包含暗色主题类
        var isDarkTheme = body.classList.contains('theme-dark');
        console.log("是否为暗色主题:", isDarkTheme);
        
        if (isDarkTheme) {
            // 切换到亮色主题
            body.classList.remove('theme-dark');
            body.classList.add('theme-light');
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'theme-light');
            console.log("切换为亮色主题");
        } else {
            // 切换到暗色主题
            body.classList.remove('theme-light');
            body.classList.add('theme-dark');
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'theme-dark');
            console.log("切换为暗色主题");
        }
        
        return false;
    };
    
    console.log("主题切换功能初始化完成");
});