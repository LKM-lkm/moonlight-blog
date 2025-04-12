// 统计控制器
const Article = require('../models/Article');

// 获取总体统计数据
exports.getOverallStats = async (req, res) => {
    try {
        // 在实际项目中，这些数据应该从数据库中查询
        // 由于我们注释掉了MongoDB连接，这里使用模拟数据进行测试
        const stats = {
            totalArticles: 24,
            totalViews: 12500,
            totalComments: 348,
            totalLikes: 892
        };
        
        res.json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('获取总体统计数据错误:', error);
        res.status(500).json({
            status: 'error',
            message: '获取统计数据失败'
        });
    }
};

// 获取文章趋势数据
exports.getArticleTrends = async (req, res) => {
    try {
        // 模拟最近7天的数据
        const trends = [
            { date: '2025-04-06', views: 320, comments: 12, likes: 45 },
            { date: '2025-04-07', views: 450, comments: 18, likes: 56 },
            { date: '2025-04-08', views: 280, comments: 9, likes: 32 },
            { date: '2025-04-09', views: 390, comments: 14, likes: 48 },
            { date: '2025-04-10', views: 520, comments: 22, likes: 67 },
            { date: '2025-04-11', views: 610, comments: 28, likes: 75 },
            { date: '2025-04-12', views: 480, comments: 20, likes: 60 }
        ];
        
        res.json({
            status: 'success',
            data: trends
        });
    } catch (error) {
        console.error('获取文章趋势数据错误:', error);
        res.status(500).json({
            status: 'error',
            message: '获取趋势数据失败'
        });
    }
};

// 获取热门文章
exports.getPopularArticles = async (req, res) => {
    try {
        // 模拟热门文章数据
        const popularArticles = [
            { id: 1, title: '如何提高编程效率', views: 823, comments: 45, likes: 112 },
            { id: 2, title: '现代Web开发技术概览', views: 756, comments: 38, likes: 98 },
            { id: 3, title: '人工智能在日常生活中的应用', views: 645, comments: 29, likes: 87 },
            { id: 4, title: '学习新语言的有效方法', views: 578, comments: 24, likes: 76 },
            { id: 5, title: '如何保持工作与生活的平衡', views: 512, comments: 18, likes: 65 }
        ];
        
        res.json({
            status: 'success',
            data: popularArticles
        });
    } catch (error) {
        console.error('获取热门文章错误:', error);
        res.status(500).json({
            status: 'error',
            message: '获取热门文章失败'
        });
    }
};

// 获取分类统计
exports.getCategoryStats = async (req, res) => {
    try {
        // 模拟分类统计数据
        const categoryStats = [
            { name: '技术', count: 12 },
            { name: '生活', count: 8 },
            { name: '学习', count: 6 },
            { name: '工作', count: 5 },
            { name: '其他', count: 3 }
        ];
        
        res.json({
            status: 'success',
            data: categoryStats
        });
    } catch (error) {
        console.error('获取分类统计错误:', error);
        res.status(500).json({
            status: 'error',
            message: '获取分类统计失败'
        });
    }
};

// 获取标签统计
exports.getTagStats = async (req, res) => {
    try {
        // 模拟标签统计数据
        const tagStats = [
            { name: 'JavaScript', count: 9 },
            { name: 'Python', count: 7 },
            { name: 'Web开发', count: 6 },
            { name: '数据科学', count: 5 },
            { name: '人工智能', count: 4 },
            { name: '前端', count: 4 },
            { name: '后端', count: 3 },
            { name: '云计算', count: 3 },
            { name: '移动开发', count: 2 },
            { name: '区块链', count: 2 }
        ];
        
        res.json({
            status: 'success',
            data: tagStats
        });
    } catch (error) {
        console.error('获取标签统计错误:', error);
        res.status(500).json({
            status: 'error',
            message: '获取标签统计失败'
        });
    }
}; 