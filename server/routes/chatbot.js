// server/routes/chatbot.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    initializeChat,
    sendMessage,
    getConversationHistory,
    archiveConversation
} = require('../controllers/chatbotController');

// 初始化聊天
router.post('/initialize', initializeChat);

// 发送消息
router.post('/message', sendMessage);

// 获取对话历史（需要认证）
router.get('/history', authenticate, getConversationHistory);

// 归档对话（需要认证）
router.patch('/archive/:id', authenticate, archiveConversation);

// 速率限制中间件
const rateLimit = require('express-rate-limit');
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 50, // 限制每个IP 50次请求
    message: {
        status: 'error',
        message: '请求过于频繁，请稍后再试'
    }
});

// 应用速率限制
router.use('/message', chatLimiter);

module.exports = router;