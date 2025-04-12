const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true,
        maxlength: 200
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverImage: {
        type: String,
        default: '/assets/images/default-cover.jpg'
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: true,
        trim: true
    },
    readTime: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    publishDate: {
        type: Date
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// 更新最后修改时间的中间件
articleSchema.pre('save', function(next) {
    this.lastModified = new Date();
    next();
});

// 自动计算阅读时间的方法
articleSchema.methods.calculateReadTime = function() {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
};

module.exports = mongoose.model('Article', articleSchema); 