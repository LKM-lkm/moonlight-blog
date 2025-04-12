const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const {
    createArticle,
    getArticles,
    getArticle,
    updateArticle,
    deleteArticle,
    addComment
} = require('../controllers/articleController');

// 获取文章列表（公开）
router.get('/', getArticles);

// 获取单篇文章（公开）
router.get('/:id', getArticle);

// 创建文章（需要认证）
router.post('/', authenticate, createArticle);

// 更新文章（需要认证）
router.patch('/:id', authenticate, updateArticle);

// 删除文章（需要认证）
router.delete('/:id', authenticate, deleteArticle);

// 添加评论（需要认证）
router.post('/:id/comments', authenticate, addComment);

// 获取草稿（需要管理员权限）
router.get('/drafts', authenticate, isAdmin, async (req, res) => {
    try {
        const drafts = await Article.find({ status: 'draft' })
            .populate('author', 'username avatar')
            .sort({ lastModified: -1 });

        res.json({
            status: 'success',
            data: { drafts }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '获取草稿失败'
        });
    }
});

module.exports = router; 