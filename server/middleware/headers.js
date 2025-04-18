const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const setHeaders = (req, res, next) => {
    // 设置安全头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // 根据文件类型设置正确的Content-Type
    const ext = path.extname(req.path);
    switch (ext) {
        case '.css':
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
            break;
        case '.js':
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            break;
        case '.html':
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            break;
        case '.json':
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            break;
        case '.woff2':
            res.setHeader('Content-Type', 'font/woff2');
            break;
    }
    
    // 为静态资源添加缓存破坏
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|woff2)$/)) {
        try {
            const filePath = path.join(__dirname, '../..', req.path);
            const fileContent = fs.readFileSync(filePath);
            const hash = crypto.createHash('md5').update(fileContent).digest('hex').slice(0, 8);
            
            // 添加ETag
            res.setHeader('ETag', `"${hash}"`);
            
            // 设置长期缓存
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } catch (error) {
            console.error('Error generating ETag:', error);
        }
    } else {
        // 动态内容不缓存
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    
    next();
};

module.exports = setHeaders; 