// 验证邮箱格式
exports.validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 验证密码强度
exports.validatePassword = (password) => {
    // 密码至少6位，包含字母和数字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
};

// 验证用户名格式
exports.validateUsername = (username) => {
    // 用户名3-20位，只能包含字母、数字、下划线
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

// 验证标题格式
exports.validateTitle = (title) => {
    return title.length >= 2 && title.length <= 100;
};

// 验证内容长度
exports.validateContent = (content) => {
    return content.length >= 10;
};

// 验证URL格式
exports.validateUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}; 