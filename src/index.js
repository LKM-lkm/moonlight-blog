// 月光云海博客 - 主入口文件
console.log('月光云海博客已加载');

// 不使用ES6模块导入，页面会直接加载所需的脚本和样式

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 如果全局有bindEvents函数则调用它
    if (typeof bindEvents === 'function') {
        bindEvents();
    } else {
        console.warn("全局bindEvents函数未找到");
    }
}); 