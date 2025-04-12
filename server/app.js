// server/app.js
const express = require('express');
const mongoose = require('mongoose');
const chatbotRoutes = require('./routes/chatbot');

const app = express();

// 中间件配置
app.use(express.json());

// 注册聊天机器人路由
app.use('/api/chatbot', chatbotRoutes);

// 数据库连接
mongoose.connect('mongodb://localhost:27017/blog_admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));