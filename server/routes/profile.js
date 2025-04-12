const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 用户资料路由
// 获取当前用户资料
router.get('/', auth.authenticate, (req, res) => {
    try {
        // 简单的返回用户信息，实际项目中可能需要从数据库获取更多信息
        const user = {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            // 其他用户资料信息
        };
        
        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        console.error('获取用户资料错误:', error);
        res.status(500).json({
            status: 'error',
            message: '获取用户资料失败'
        });
    }
});

// 更新用户资料
router.put('/', auth.authenticate, (req, res) => {
    try {
        // 这里应该有更新用户信息的逻辑
        // 例如：从req.body获取更新信息，然后更新数据库
        
        res.json({
            status: 'success',
            message: '用户资料已更新',
            data: {
                // 返回更新后的用户信息
            }
        });
    } catch (error) {
        console.error('更新用户资料错误:', error);
        res.status(500).json({
            status: 'error',
            message: '更新用户资料失败'
        });
    }
});

module.exports = router; 