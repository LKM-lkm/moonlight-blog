const setHeaders = (req, res, next) => {
    // 设置正确的Content-Type和其他安全头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    // 设置缓存控制
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|woff2)$/)) {
        // 静态资源缓存1年
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
        // 动态内容不缓存
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    
    next();
};

module.exports = setHeaders; 