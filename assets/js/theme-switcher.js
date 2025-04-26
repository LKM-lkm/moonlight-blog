/**
 * 主题切换器 - 无依赖原生JavaScript
 */
(function() {
  // 在DOM加载完成后初始化
  document.addEventListener('DOMContentLoaded', function() {
    console.log("初始化主题切换器...");
    
    // 获取DOM元素
    var themeToggleBtn = document.getElementById('theme-toggle-btn');
    var body = document.body;
    
    if (!themeToggleBtn) {
      console.error("找不到主题切换按钮，跳过初始化");
      return;
    }
    
    // 获取主题切换按钮图标
    var icon = themeToggleBtn.querySelector('i');
    if (!icon) {
      console.error("找不到主题切换按钮图标");
      return;
    }
    
    console.log("主题切换器: 找到按钮和图标");
    
    // 加载并应用保存的主题
    applyTheme();
    
    // 绑定点击事件
    themeToggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("切换主题");
      
      // 检查当前主题并切换
      if (body.classList.contains('theme-dark')) {
        // 从深色切换到亮色
        setTheme('theme-light');
      } else {
        // 从亮色切换到深色
        setTheme('theme-dark');
      }
      
      return false;
    });
    
    // 处理系统主题变化
    var prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDarkScheme.addEventListener) {
      prefersDarkScheme.addEventListener('change', function(e) {
        // 只在用户没有明确选择主题时响应系统变化
        if (!localStorage.getItem('theme')) {
          applyTheme();
        }
      });
    }
    
    // 应用主题函数
    function applyTheme() {
      var savedTheme = localStorage.getItem('theme');
      var prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      console.log("应用主题: 已保存=" + savedTheme + ", 系统深色=" + prefersDarkMode);
      
      // 清除现有主题类
      body.classList.remove('theme-light', 'theme-dark');
      
      if (savedTheme === 'theme-dark') {
        setTheme('theme-dark');
      } else if (savedTheme === 'theme-light') {
        setTheme('theme-light');
      } else if (prefersDarkMode) {
        setTheme('theme-dark');
      } else {
        setTheme('theme-light');
      }
    }
    
    // 设置主题函数
    function setTheme(themeName) {
      // 更新类名
      body.classList.remove('theme-light', 'theme-dark');
      body.classList.add(themeName);
      
      // 更新图标
      if (themeName === 'theme-dark') {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
      
      // 保存到localStorage
      localStorage.setItem('theme', themeName);
      console.log("设置主题为: " + themeName);
    }
  });
})();