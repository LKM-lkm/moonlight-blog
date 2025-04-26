<?php
/**
 * 全局配置
 */
return [
    // 调试模式
    'debug' => true,

    // 站点配置
    'site' => [
        'name' => 'Moonlight Blog',
        'url' => 'http://localhost',
        'admin_email' => 'admin@example.com',
        'charset' => 'UTF-8',
        'timezone' => 'Asia/Shanghai',
        'language' => 'zh-CN'
    ],

    // 数据库配置
    'database' => [
        'host' => 'localhost',
        'port' => 3306,
        'database' => 'moonlight_blog',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ]
    ],

    // 安全配置
    'security' => [
        'password_algo' => PASSWORD_BCRYPT,
        'password_options' => [
            'cost' => 12
        ],
        'session_lifetime' => 7200,
        'csrf_lifetime' => 3600,
        'password_min_length' => 8,
        'password_require_special' => true,
        'password_require_number' => true,
        'password_require_uppercase' => true,
        'password_require_lowercase' => true,
        'login_max_attempts' => 5,
        'login_lockout_duration' => 300, // 5分钟
        'session_regenerate_time' => 300, // 5分钟
        'remember_me_duration' => 2592000 // 30天
    ],

    // 会话配置
    'session' => [
        'name' => 'MOONLIGHT_SESSION',
        'lifetime' => 7200, // 2小时
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'use_strict_mode' => true,
        'use_cookies' => true,
        'use_only_cookies' => true
    ],

    // 上传配置
    'upload' => [
        'max_size' => 5 * 1024 * 1024,
        'allowed_types' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        'max_width' => 2048,
        'max_height' => 2048,
        'path' => dirname(__DIR__) . '/uploads',
        'url' => '/uploads'
    ],

    // API配置
    'api' => [
        'rate_limit' => [
            'enabled' => true,
            'max_requests' => 60,
            'time_period' => 60 // 1分钟
        ],
        'cors' => [
            'enabled' => true,
            'allowed_origins' => ['http://localhost:8080'],
            'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'allowed_headers' => ['Content-Type', 'X-CSRF-Token', 'Authorization'],
            'expose_headers' => [],
            'max_age' => 3600,
            'allow_credentials' => true
        ]
    ],

    // 缓存配置
    'cache' => [
        'enabled' => true,
        'driver' => 'file',
        'path' => dirname(__DIR__) . '/cache',
        'lifetime' => 3600,
    ],

    // 日志配置
    'logging' => [
        'enabled' => true,
        'level' => 'debug',
        'file' => dirname(__DIR__) . '/logs/app.log',
    ]
]; 