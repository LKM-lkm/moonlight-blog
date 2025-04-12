const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validateEmail, validatePassword } = require('../utils/validators');

// 用户注册
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 输入验证
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: '所有字段都是必填的'
            });
        }

        // 验证邮箱格式
        if (!validateEmail(email)) {
            return res.status(400).json({
                status: 'error',
                message: '无效的邮箱格式'
            });
        }

        // 验证密码强度
        if (!validatePassword(password)) {
            return res.status(400).json({
                status: 'error',
                message: '密码必须至少包含6个字符，包括字母和数字'
            });
        }

        // 检查用户是否已存在
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: '用户名或邮箱已被使用'
            });
        }

        // 创建新用户
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // 生成JWT令牌
        const token = generateToken(user._id);

        res.status(201).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '注册失败'
        });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 检查是否提供了凭证
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: '请提供邮箱和密码'
            });
        }

        // 根据邮箱查找用户
        const user = await User.findOne({ email });
        
        // 如果用户不存在或密码不匹配
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: 'error',
                message: '邮箱或密码不正确'
            });
        }

        // 更新最后登录时间
        user.lastLogin = Date.now();
        await user.save();

        // 生成JWT令牌
        const token = generateToken(user._id);

        // 设置HTTP-only cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // 在生产环境中使用secure
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
            sameSite: 'strict'
        });

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '登录失败'
        });
    }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: '用户不存在'
            });
        }
        
        res.json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '获取用户信息失败'
        });
    }
};

// 更新用户信息
exports.updateProfile = async (req, res) => {
    try {
        const { username, email, avatar } = req.body;
        const updates = {};

        if (username) updates.username = username;
        if (email) {
            if (!validateEmail(email)) {
                return res.status(400).json({
                    status: 'error',
                    message: '无效的邮箱格式'
                });
            }
            updates.email = email;
        }
        if (avatar) updates.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '更新用户信息失败'
        });
    }
}; 