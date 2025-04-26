// 实用工具函数库
var adminUtils = (function() {
    // 显示消息提示
    function showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        messageContainer.appendChild(messageElement);
        
        // 3秒后自动消失
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => messageContainer.removeChild(messageElement), 500);
        }, 3000);
    }
    
    // 显示加载中
    function showLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
    }
    
    // 隐藏加载中
    function hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    
    // 格式化日期显示
    function formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    // 验证字段
    function validateField(value, rules) {
        const result = {
            valid: true,
            message: ''
        };
        
        if (rules.required && !value) {
            result.valid = false;
            result.message = '此字段为必填项';
            return result;
        }
        
        if (rules.minLength && value.length < rules.minLength) {
            result.valid = false;
            result.message = `最少需要${rules.minLength}个字符`;
            return result;
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
            result.valid = false;
            result.message = rules.patternMessage || '格式不正确';
            return result;
        }
        
        return result;
    }
    
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // 节流函数
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // 深度克隆对象
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // 处理日期对象
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        // 处理数组
        if (Array.isArray(obj)) {
            return obj.map(item => deepClone(item));
        }
        
        // 处理普通对象
        const clonedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        
        return clonedObj;
    }
    
    // 获取URL参数
    function getUrlParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split('&');
        
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
        
        return params;
    }
    
    // 生成随机ID
    function generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            id += chars.charAt(randomIndex);
        }
        
        return id;
    }
    
    // 导出工具函数
    return {
        showMessage,
        showLoading,
        hideLoading,
        formatDate,
        validateField,
        debounce,
        throttle,
        deepClone,
        getUrlParams,
        generateId
    };
})(); 