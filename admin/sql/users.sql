-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','editor','user') NOT NULL DEFAULT 'user',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text,
  `last_login` datetime DEFAULT NULL,
  `login_attempts` int(11) NOT NULL DEFAULT '0',
  `last_attempt_time` datetime DEFAULT NULL,
  `reset_token` varchar(100) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户权限表
CREATE TABLE IF NOT EXISTS `user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_permission` (`user_id`,`permission`),
  CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户登录日志表
CREATE TABLE IF NOT EXISTS `user_login_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(255) NOT NULL,
  `success` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_user_login_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员用户
INSERT INTO `users` (`username`, `email`, `password`, `role`, `status`, `created_at`) VALUES
('likem', 'lkm836972@outlook.com', '$2y$12$K8HKs.PvDfc27jkwMCOzgu6Zg9YH4pQSYEBpDQpzh4WqKmPqUz7Aq', 'admin', 1, NOW());

-- 插入默认权限
INSERT INTO `user_permissions` (`user_id`, `permission`) VALUES
(1, 'manage_users'),
(1, 'manage_posts'),
(1, 'manage_categories'),
(1, 'manage_comments'),
(1, 'manage_settings'),
(1, 'manage_plugins'),
(1, 'manage_themes'),
(1, 'manage_media'),
(1, 'view_statistics'),
(1, 'manage_backups'); 