/**
 * Font Awesome 加载检测脚本
 * 确保图标字体正确加载，如果失败则显示备用图标
 */

(function() {
    'use strict';
    
    // 检测Font Awesome是否加载成功
    function checkFontAwesome() {
        // 创建一个测试元素
        const testElement = document.createElement('i');
        testElement.className = 'fas fa-home';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.style.fontSize = '1px';
        document.body.appendChild(testElement);
        
        // 获取计算后的样式
        const computedStyle = window.getComputedStyle(testElement, ':before');
        const content = computedStyle.getPropertyValue('content');
        
        // 移除测试元素
        document.body.removeChild(testElement);
        
        // 如果content为空或为none，说明Font Awesome未加载
        if (!content || content === 'none' || content === 'normal') {
            console.warn('Font Awesome 加载失败，使用备用图标');
            replaceIconsWithFallback();
        } else {
            console.log('Font Awesome 加载成功');
        }
    }
    
    // 替换图标为备用文本
    function replaceIconsWithFallback() {
        const iconMap = {
            'fas fa-moon': '🌙',
            'fas fa-sun': '☀️',
            'fas fa-search': '🔍',
            'fas fa-file-alt': '📄',
            'fas fa-code': '💻',
            'fas fa-calendar-alt': '📅',
            'fas fa-envelope': '📧',
            'fas fa-video': '🎥',
            'fas fa-comments': '💬',
            'fas fa-times': '✕',
            'fas fa-paper-plane': '📤',
            'fas fa-chevron-left': '‹',
            'fas fa-chevron-right': '›',
            'fab fa-github': '🐙',
            'fab fa-twitter': '🐦',
            'fas fa-user': '👤',
            'fas fa-sign-out-alt': '🚪',
            'fas fa-chart-line': '📈',
            'fas fa-comments': '💬',
            'fas fa-users': '👥',
            'fas fa-cog': '⚙️',
            'fas fa-bars': '☰',
            'fas fa-bell': '🔔',
            'fas fa-eye': '👁️',
            'fas fa-arrow-up': '↑',
            'fas fa-arrow-down': '↓',
            'fas fa-comment': '💭',
            'fas fa-trash': '🗑️',
            'fas fa-clock': '🕐',
            'fas fa-link': '🔗',
            'fas fa-check': '✓',
            'fas fa-reply': '↩️'
        };
        
        // 替换所有图标
        const icons = document.querySelectorAll('i[class*="fa-"]');
        icons.forEach(icon => {
            const classes = icon.className.split(' ');
            const iconClass = classes.find(cls => cls.startsWith('fa-'));
            if (iconClass && iconMap[iconClass]) {
                icon.textContent = iconMap[iconClass];
                icon.className = 'fallback-icon';
            }
        });
    }
    
    // 添加备用图标样式
    function addFallbackStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .fallback-icon {
                font-style: normal;
                font-family: inherit;
                display: inline-block;
                text-align: center;
                min-width: 1em;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        addFallbackStyles();
        
        // 延迟检查，确保Font Awesome有足够时间加载
        setTimeout(checkFontAwesome, 1000);
        
        // 如果页面加载后5秒再次检查
        setTimeout(checkFontAwesome, 5000);
    });
})(); 