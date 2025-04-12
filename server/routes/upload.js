const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadImage, deleteImage, getUploadMiddleware } = require('../controllers/uploadController');

// 上传图片（需要认证）
router.post('/image', 
    authenticate,
    getUploadMiddleware(),
    uploadImage
);

// 删除图片（需要认证）
router.delete('/image',
    authenticate,
    deleteImage
);

// 错误处理中间件
router.use((error, req, res, next) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            status: 'error',
            message: '文件大小不能超过5MB'
        });
    }

    if (error.message === '不支持的文件类型') {
        return res.status(400).json({
            status: 'error',
            message: '只支持JPG、PNG、GIF和WebP格式的图片'
        });
    }

    console.error('文件上传错误:', error);
    res.status(500).json({
        status: 'error',
        message: '文件上传过程中发生错误'
    });
});

module.exports = router; 