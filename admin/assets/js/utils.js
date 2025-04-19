// 显示消息提示
export function showMessage(message, type = 'info') {
    const messageBox = document.createElement('div');
    messageBox.className = `message ${type}`;
    messageBox.textContent = message;
    
    document.body.appendChild(messageBox);
    
    // 2秒后自动移除消息
    setTimeout(() => {
        messageBox.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(messageBox);
        }, 300);
    }, 2000);
}

// 显示加载中
export function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
    `;
    
    document.body.appendChild(loading);
}

// 隐藏加载中
export function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(loading);
        }, 300);
    }
}

// 格式化日期
export function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 验证表单字段
export function validateField(value, rules) {
    const errors = [];
    
    if (rules.required && !value) {
        errors.push('此字段不能为空');
    }
    
    if (rules.minLength && value.length < rules.minLength) {
        errors.push(`长度不能少于 ${rules.minLength} 个字符`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`长度不能超过 ${rules.maxLength} 个字符`);
    }
    
    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push('请输入有效的邮箱地址');
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.message || '格式不正确');
    }
    
    return errors;
}

// 防抖函数
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 深拷贝对象
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (obj instanceof Object) {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = deepClone(obj[key]);
        });
        return copy;
    }
}

// 获取URL参数
export function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
}

// 生成随机ID
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
} 