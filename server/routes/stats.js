const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const {
    getOverallStats,
    getArticleTrends,
    getPopularArticles,
    getCategoryStats,
    getTagStats
} = require('../controllers/statsController');

// 获取总体统计数据（需要管理员权限）
router.get('/overall', authenticate, isAdmin, getOverallStats);

// 获取文章趋势数据（需要管理员权限）
router.get('/trends', authenticate, isAdmin, getArticleTrends);

// 获取热门文章（公开）
router.get('/popular', getPopularArticles);

// 获取分类统计（公开）
router.get('/categories', getCategoryStats);

// 获取标签统计（公开）
router.get('/tags', getTagStats);

module.exports = router; 