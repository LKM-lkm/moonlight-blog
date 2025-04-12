const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT认证中间件
exports.authenticate = async (req, res, next) => {
    try {
        // 注释掉原先的验证逻辑
        /*
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
        */

        // 添加一个模拟用户到请求对象
        console.log('临时认证：跳过令牌验证，使用模拟用户');
        req.user = {
            _id: '6400d1234567890123456789',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
        };
        
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
    console.log('临时管理员权限验证：允许所有请求');
    // 无条件放行，允许所有请求
    next();
    /*
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            status: 'error',
            message: '需要管理员权限'
        });
    }
    */
};

// 生成JWT令牌
exports.generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}; 