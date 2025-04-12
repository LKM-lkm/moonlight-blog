const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    register,
    login,
    getCurrentUser,
    updateProfile
} = require('../controllers/authController');

// 注册新用户
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, getCurrentUser);

// 更新用户信息（需要认证）
router.patch('/profile', authenticate, updateProfile);

module.exports = router; 