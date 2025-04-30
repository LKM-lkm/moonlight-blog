const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 生成JWT令牌
exports.generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// 验证JWT令牌
exports.authenticate = async (req, res, next) => {
    try {
        // 从请求头或cookie中获取令牌
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: '未提供认证令牌'
            });
        }

        // 验证令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 查找用户
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: '用户不存在'
            });
        }

        // 将用户信息添加到请求对象
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: '无效的认证令牌'
        });
    }
};

// 检查用户角色
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            status: 'error',
            message: '需要管理员权限'
        });
    }
};

// 生成CSRF令牌
exports.generateCsrfToken = () => {
    return require('crypto').randomBytes(32).toString('hex');
};

// 验证CSRF令牌
exports.validateCsrfToken = (req, res, next) => {
    const token = req.headers['x-csrf-token'] || req.body.csrf_token;
    
    if (!token || !req.session.csrfToken || token !== req.session.csrfToken) {
        return res.status(403).json({
            status: 'error',
            message: '无效的CSRF令牌'
        });
    }
    
    next();
}; 