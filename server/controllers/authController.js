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
        // 临时测试用户，无论输入什么凭证都允许登录
        console.log('临时登录功能：允许所有登录请求');
        
        // 生成临时测试用户
        const mockUser = {
            _id: '6400d1234567890123456789',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
        };
        
        // 生成JWT令牌
        const token = generateToken(mockUser._id);

        res.json({
            status: 'success',
            data: {
                token,
                user: {
                    id: mockUser._id,
                    username: mockUser.username,
                    email: mockUser.email,
                    role: mockUser.role
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
        // 使用模拟数据而不是查询数据库
        const mockUser = {
            _id: '6400d1234567890123456789',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
        };
        
        res.json({
            status: 'success',
            data: { user: mockUser }
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