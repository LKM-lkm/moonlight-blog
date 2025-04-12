const Conversation = require('../models/Conversation');
const axios = require('axios');

// 初始化聊天
exports.initializeChat = async (req, res) => {
    try {
        const conversation = new Conversation({
            user: req.user ? req.user._id : null
        });

        // 添加欢迎消息
        conversation.addMessage('bot', '你好！我是云月，很高兴与你交流。有什么我可以帮助你的吗？');
        await conversation.save();

        res.status(201).json({
            status: 'success',
            data: { conversation }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '初始化聊天失败'
        });
    }
};

// 发送消息
exports.sendMessage = async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                status: 'error',
                message: '消息不能为空'
            });
        }

        let conversation;
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({
                    status: 'error',
                    message: '对话不存在'
                });
            }
        } else {
            conversation = new Conversation({
                user: req.user ? req.user._id : null
            });
        }

        // 添加用户消息
        conversation.addMessage('user', message.trim());

        // 调用AI接口获取回复
        try {
            const aiResponse = await generateAIResponse(message, conversation.messages);
            conversation.addMessage('bot', aiResponse);
        } catch (error) {
            console.error('AI响应错误:', error);
            conversation.addMessage('bot', '抱歉，我现在无法正常回答。请稍后再试。');
        }

        await conversation.save();

        res.json({
            status: 'success',
            data: {
                conversation,
                lastMessage: conversation.messages[conversation.messages.length - 1]
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '发送消息失败'
        });
    }
};

// 获取对话历史
exports.getConversationHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const conversations = await Conversation.find({
            user: req.user._id
        })
        .sort({ lastActivity: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

        const total = await Conversation.countDocuments({ user: req.user._id });

        res.json({
            status: 'success',
            data: {
                conversations,
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
            message: '获取对话历史失败'
        });
    }
};

// 生成AI响应
async function generateAIResponse(message, conversationHistory) {
    try {
        // 准备对话历史
        const history = conversationHistory.slice(-5).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        // 调用OpenAI API
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: '你是一个名叫云月的友好AI助手，专注于帮助用户解答问题。你的回答应该简洁、准确、友好。'
                },
                ...history,
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('AI生成响应失败:', error);
        throw new Error('AI生成响应失败');
    }
}

// 归档对话
exports.archiveConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            { status: 'archived' },
            { new: true }
        );

        if (!conversation) {
            return res.status(404).json({
                status: 'error',
                message: '对话不存在或无权限归档'
            });
        }

        res.json({
            status: 'success',
            data: { conversation }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '归档对话失败'
        });
    }
}; 