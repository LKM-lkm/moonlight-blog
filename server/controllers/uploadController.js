const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// 配置存储
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const type = req.body.type || 'misc';
        const uploadDir = path.join(__dirname, `../../uploads/${type}`);
        
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueId}${ext}`);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('不支持的文件类型'), false);
    }
};

// 配置multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// 处理图片上传
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: '没有上传文件'
            });
        }

        const { type = 'misc' } = req.body;
        const originalPath = req.file.path;
        const filename = req.file.filename;
        const outputDir = path.join(__dirname, `../../uploads/${type}`);

        // 确保输出目录存在
        await fs.mkdir(outputDir, { recursive: true });

        // 处理图片
        const processedFilename = `processed_${filename}`;
        const processedPath = path.join(outputDir, processedFilename);

        await sharp(originalPath)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(processedPath);

        // 生成缩略图
        const thumbnailFilename = `thumb_${filename}`;
        const thumbnailPath = path.join(outputDir, thumbnailFilename);

        await sharp(originalPath)
            .resize(300, 300, {
                fit: 'cover'
            })
            .jpeg({ quality: 70 })
            .toFile(thumbnailPath);

        // 删除原始文件
        await fs.unlink(originalPath);

        // 返回文件路径
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const urls = {
            full: `${baseUrl}/uploads/${type}/${processedFilename}`,
            thumbnail: `${baseUrl}/uploads/${type}/${thumbnailFilename}`
        };

        res.json({
            status: 'success',
            data: { urls }
        });
    } catch (error) {
        console.error('文件上传错误:', error);
        res.status(500).json({
            status: 'error',
            message: '文件上传失败'
        });
    }
};

// 删除图片
exports.deleteImage = async (req, res) => {
    try {
        const { filename, type = 'misc' } = req.body;
        
        if (!filename) {
            return res.status(400).json({
                status: 'error',
                message: '未指定文件名'
            });
        }

        const baseDir = path.join(__dirname, `../../uploads/${type}`);
        const processedPath = path.join(baseDir, `processed_${filename}`);
        const thumbnailPath = path.join(baseDir, `thumb_${filename}`);

        // 删除处理后的图片和缩略图
        await Promise.all([
            fs.unlink(processedPath).catch(() => {}),
            fs.unlink(thumbnailPath).catch(() => {})
        ]);

        res.json({
            status: 'success',
            message: '文件删除成功'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '文件删除失败'
        });
    }
};

// 获取上传中间件
exports.getUploadMiddleware = () => {
    return upload.single('file');
}; 