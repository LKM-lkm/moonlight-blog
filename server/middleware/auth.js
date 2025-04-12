const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT认证中间件
exports.authenticate = async (req, res, next) => {
    try {
        // 从请求头获取token
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: '未提供认证令牌'
            });
        }

        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 查找用户
        const user = await User.findById(decoded.userId);
        
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
        res.status(401).json({
            status: 'error',
            message: '无效的认证令牌'
        });
    }
};

// 管理员权限验证中间件
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

// 生成JWT令牌
exports.generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}; 