-- 系统设置数据库结构
-- 创建时间: 2023-11-15
-- 描述: 存储系统设置和备份信息

-- 设置表
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL COMMENT '设置类别',
  `key` varchar(100) NOT NULL COMMENT '设置键名',
  `value` text COMMENT '设置值',
  `description` varchar(255) DEFAULT NULL COMMENT '设置描述',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_key` (`category`, `key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

-- 备份表
CREATE TABLE IF NOT EXISTS `backups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '备份名称',
  `description` text COMMENT '备份描述',
  `filename` varchar(255) NOT NULL COMMENT '备份文件名',
  `size` bigint(20) NOT NULL COMMENT '备份大小(字节)',
  `status` enum('success','error') NOT NULL DEFAULT 'success' COMMENT '备份状态',
  `created_by` int(11) NOT NULL COMMENT '创建者ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `backups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统备份表';

-- 插入默认设置
INSERT INTO `settings` (`category`, `key`, `value`, `description`) VALUES
-- 基本设置
('basic', 'site_name', '月光博客', '网站名称'),
('basic', 'site_description', '一个简单的博客系统', '网站描述'),
('basic', 'site_keywords', '博客,月光,个人网站', '网站关键词'),
('basic', 'site_logo', '', '网站Logo'),
('basic', 'site_favicon', '', '网站图标'),
('basic', 'site_theme', 'light', '网站主题'),
('basic', 'site_language', 'zh-CN', '网站语言'),
('basic', 'site_timezone', 'Asia/Shanghai', '网站时区'),
('basic', 'enable_comments', '1', '启用评论'),
('basic', 'enable_registration', '1', '启用注册'),

-- 安全设置
('security', 'login_attempts', '5', '登录尝试次数'),
('security', 'login_timeout', '30', '登录超时时间(分钟)'),
('security', 'password_min_length', '8', '密码最小长度'),
('security', 'password_require_uppercase', '1', '密码要求大写字母'),
('security', 'password_require_number', '1', '密码要求数字'),
('security', 'password_require_special', '1', '密码要求特殊字符'),
('security', 'enable_2fa', '0', '启用双因素认证'),
('security', 'ip_blacklist', '', 'IP黑名单'),
('security', 'force_ssl', '0', '强制SSL'),

-- 邮件设置
('email', 'smtp_host', '', 'SMTP主机'),
('email', 'smtp_port', '587', 'SMTP端口'),
('email', 'smtp_username', '', 'SMTP用户名'),
('email', 'smtp_password', '', 'SMTP密码'),
('email', 'smtp_encryption', 'tls', 'SMTP加密方式'),
('email', 'smtp_from_name', '', '发件人名称'),
('email', 'smtp_from_email', '', '发件人邮箱'),
('email', 'enable_notifications', '1', '启用通知'),

-- 存储设置
('storage', 'storage_type', 'local', '存储类型'),
('storage', 'local_path', 'uploads', '本地存储路径'),
('storage', 's3_bucket', '', 'S3存储桶'),
('storage', 's3_region', '', 'S3区域'),
('email', 's3_access_key', '', 'S3访问密钥'),
('email', 's3_secret_key', '', 'S3密钥'),
('storage', 'enable_cdn', '0', '启用CDN'),
('storage', 'cdn_url', '', 'CDN URL'),

-- 备份设置
('backup', 'auto_backup', '0', '自动备份'),
('backup', 'backup_frequency', 'daily', '备份频率'),
('backup', 'backup_time', '00:00', '备份时间'),
('backup', 'backup_retention', '30', '备份保留天数'),
('backup', 'backup_encryption', '0', '备份加密'),

-- 高级设置
('advanced', 'custom_css', '', '自定义CSS'),
('advanced', 'custom_js', '', '自定义JavaScript'),
('advanced', 'header_code', '', '页头代码'),
('advanced', 'footer_code', '', '页脚代码'),
('advanced', 'enable_debug', '0', '启用调试'),
('advanced', 'enable_cache', '1', '启用缓存'),
('advanced', 'cache_lifetime', '3600', '缓存生命周期(秒)'); 