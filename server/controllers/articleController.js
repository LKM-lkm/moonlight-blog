const Article = require('../models/Article');
const { validateTitle, validateContent } = require('../utils/validators');

// 创建文章
exports.createArticle = async (req, res) => {
    try {
        const { title, content, summary, category, tags, coverImage } = req.body;

        // 输入验证
        if (!validateTitle(title)) {
            return res.status(400).json({
                status: 'error',
                message: '标题长度必须在2-100字符之间'
            });
        }

        if (!validateContent(content)) {
            return res.status(400).json({
                status: 'error',
                message: '文章内容至少需要10个字符'
            });
        }

        const article = new Article({
            title,
            content,
            summary: summary || content.substring(0, 150) + '...',
            category,
            tags: tags || [],
            coverImage,
            author: req.user._id
        });

        // 计算阅读时间
        article.calculateReadTime();

        await article.save();

        res.status(201).json({
            status: 'success',
            data: { article }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '创建文章失败'
        });
    }
};

// 获取文章列表
exports.getArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const tag = req.query.tag;
        const search = req.query.search;

        const query = { status: 'published' };

        // 分类筛选
        if (category) {
            query.category = category;
        }

        // 标签筛选
        if (tag) {
            query.tags = tag;
        }

        // 搜索功能
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Article.countDocuments(query);
        const articles = await Article.find(query)
            .populate('author', 'username avatar')
            .sort({ publishDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            status: 'success',
            data: {
                articles,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '获取文章列表失败'
        });
    }
};

// 获取单篇文章
exports.getArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'username avatar')
            .populate('comments.user', 'username avatar');

        if (!article) {
            return res.status(404).json({
                status: 'error',
                message: '文章不存在'
            });
        }

        // 增加浏览量
        article.views += 1;
        await article.save();

        res.json({
            status: 'success',
            data: { article }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '获取文章失败'
        });
    }
};

// 更新文章
exports.updateArticle = async (req, res) => {
    try {
        const { title, content, summary, category, tags, coverImage, status } = req.body;
        const updates = {};

        if (title) {
            if (!validateTitle(title)) {
                return res.status(400).json({
                    status: 'error',
                    message: '标题长度必须在2-100字符之间'
                });
            }
            updates.title = title;
        }

        if (content) {
            if (!validateContent(content)) {
                return res.status(400).json({
                    status: 'error',
                    message: '文章内容至少需要10个字符'
                });
            }
            updates.content = content;
            // 如果内容更新了，重新计算阅读时间
            const article = new Article({ content });
            article.calculateReadTime();
            updates.readTime = article.readTime;
        }

        if (summary) updates.summary = summary;
        if (category) updates.category = category;
        if (tags) updates.tags = tags;
        if (coverImage) updates.coverImage = coverImage;
        if (status) updates.status = status;

        updates.lastModified = new Date();

        const article = await Article.findOneAndUpdate(
            { _id: req.params.id, author: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('author', 'username avatar');

        if (!article) {
            return res.status(404).json({
                status: 'error',
                message: '文章不存在或无权限修改'
            });
        }

        res.json({
            status: 'success',
            data: { article }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '更新文章失败'
        });
    }
};

// 删除文章
exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findOneAndDelete({
            _id: req.params.id,
            author: req.user._id
        });

        if (!article) {
            return res.status(404).json({
                status: 'error',
                message: '文章不存在或无权限删除'
            });
        }

        res.json({
            status: 'success',
            message: '文章已删除'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '删除文章失败'
        });
    }
};

// 添加评论
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length < 2) {
            return res.status(400).json({
                status: 'error',
                message: '评论内容至少需要2个字符'
            });
        }

        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                status: 'error',
                message: '文章不存在'
            });
        }

        article.comments.push({
            user: req.user._id,
            content: content.trim()
        });

        await article.save();

        // 重新获取带有用户信息的文章
        const updatedArticle = await Article.findById(req.params.id)
            .populate('author', 'username avatar')
            .populate('comments.user', 'username avatar');

        res.json({
            status: 'success',
            data: { article: updatedArticle }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '添加评论失败'
        });
    }
}; 