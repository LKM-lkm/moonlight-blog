-- 创建角色表
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建权限表
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_permissions_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建角色权限关联表
CREATE TABLE IF NOT EXISTS `role_permissions` (
    `role_id` INT UNSIGNED NOT NULL,
    `permission_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_id`, `permission_id`),
    CONSTRAINT `fk_role_permissions_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_role_permissions_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建用户角色关联表
CREATE TABLE IF NOT EXISTS `user_roles` (
    `user_id` INT UNSIGNED NOT NULL,
    `role_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `role_id`),
    CONSTRAINT `fk_user_roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建日志表
CREATE TABLE IF NOT EXISTS `logs` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `level` VARCHAR(20) NOT NULL,
    `message` TEXT NOT NULL,
    `context` JSON DEFAULT NULL,
    `user_id` INT UNSIGNED DEFAULT NULL,
    `ip` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(255) DEFAULT NULL,
    `url` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_logs_level` (`level`),
    KEY `idx_logs_user_id` (`user_id`),
    KEY `idx_logs_created_at` (`created_at`),
    CONSTRAINT `fk_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认角色
INSERT INTO `roles` (`name`, `description`) VALUES
('admin', '系统管理员，拥有所有权限'),
('editor', '内容编辑，可以管理文章和评论'),
('user', '普通用户，可以发表评论');

-- 插入默认权限
INSERT INTO `permissions` (`name`, `description`) VALUES
('settings.view', '查看系统设置'),
('settings.edit', '编辑系统设置'),
('users.view', '查看用户列表'),
('users.create', '创建用户'),
('users.edit', '编辑用户'),
('users.delete', '删除用户'),
('posts.view', '查看文章列表'),
('posts.create', '创建文章'),
('posts.edit', '编辑文章'),
('posts.delete', '删除文章'),
('comments.view', '查看评论列表'),
('comments.create', '发表评论'),
('comments.edit', '编辑评论'),
('comments.delete', '删除评论'),
('backups.create', '创建备份'),
('backups.restore', '恢复备份'),
('backups.delete', '删除备份');

-- 为管理员角色分配所有权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions`;

-- 为编辑角色分配内容管理权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `permissions` WHERE `name` IN (
    'posts.view', 'posts.create', 'posts.edit', 'posts.delete',
    'comments.view', 'comments.create', 'comments.edit', 'comments.delete'
);

-- 为普通用户角色分配基本权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, `id` FROM `permissions` WHERE `name` IN (
    'posts.view', 'comments.view', 'comments.create'
); 