const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();
const setHeaders = require('./middleware/headers');

const articleRoutes = require('./routes/articles');
const chatbotRoutes = require('./routes/chatbot');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全配置
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // 允许跨域访问上传的文件
    contentSecurityPolicy: false // 暂时禁用CSP以便于开发
}));
app.use(cors());
app.use(express.json());

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP 100次请求
});
app.use('/api/', limiter);

// 自定义头部中间件
app.use(setHeaders);

// 静态文件服务
app.use(express.static(path.join(__dirname, '../'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.woff2')) {
            res.setHeader('Content-Type', 'font/woff2');
        }
    }
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // 上传文件目录

// API路由
app.use('/api/articles', articleRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: '服务器内部错误'
    });
});

// 临时注释掉MongoDB连接，直接启动服务器
console.log('注意：MongoDB连接已被注释掉，仅用于前端测试');
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

/* 
// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('数据库连接成功');
    // 启动服务器
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
})
.catch((error) => {
    console.error('数据库连接失败:', error);
}); 
*/ 