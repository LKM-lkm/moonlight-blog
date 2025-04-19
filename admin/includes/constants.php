<?php
// 调试模式
define('DEBUG_MODE', true);

// 路径常量
define('ROOT_PATH', dirname(__DIR__));
define('CONFIG_PATH', ROOT_PATH . '/config');
define('INCLUDES_PATH', ROOT_PATH . '/includes');
define('LOGS_PATH', ROOT_PATH . '/logs');
define('UPLOADS_PATH', ROOT_PATH . '/uploads');

// 日志配置
define('LOG_FILE', LOGS_PATH . '/app.log');
define('LOG_LEVEL', 'debug'); // debug, info, warning, error, critical

// 会话配置
define('SESSION_NAME', 'moonlight_session');
define('SESSION_LIFETIME', 7200); // 2小时
define('SESSION_PATH', '/');
define('SESSION_DOMAIN', '');
define('SESSION_SECURE', false);
define('SESSION_HTTPONLY', true);

// 密码配置
define('PASSWORD_MIN_LENGTH', 8);
define('PASSWORD_MAX_LENGTH', 32);

// 登录配置
define('LOGIN_ATTEMPTS_LIMIT', 5);
define('LOGIN_LOCKOUT_TIME', 15); // 分钟

// CSRF配置
define('CSRF_TOKEN_NAME', 'csrf_token');
define('CSRF_TOKEN_LENGTH', 32);

// 上传配置
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif']);
define('ALLOWED_FILE_TYPES', ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

// 分页配置
define('ITEMS_PER_PAGE', 10);

// API配置
define('API_RATE_LIMIT', 60); // 每分钟请求次数
define('API_RATE_WINDOW', 60); // 时间窗口（秒）

// 缓存配置
define('CACHE_ENABLED', true);
define('CACHE_LIFETIME', 3600); // 1小时

// 时区配置
date_default_timezone_set('Asia/Shanghai'); 