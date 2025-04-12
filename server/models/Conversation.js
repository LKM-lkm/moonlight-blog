const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'bot'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    startTime: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    }
});

// 更新最后活动时间的中间件
conversationSchema.pre('save', function(next) {
    this.lastActivity = new Date();
    next();
});

// 添加消息的方法
conversationSchema.methods.addMessage = function(role, content) {
    this.messages.push({
        role,
        content,
        timestamp: new Date()
    });
    this.lastActivity = new Date();
};

// 获取最后N条消息的方法
conversationSchema.methods.getLastMessages = function(count = 10) {
    return this.messages.slice(-count);
};

module.exports = mongoose.model('Conversation', conversationSchema); 