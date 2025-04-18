<?php
/**
 * 用户类
 * 
 * 处理用户认证和权限管理，包括：
 * - 用户登录
 * - 用户注册
 * - 用户信息管理
 * - 权限检查
 */

class User {
    private $db;
    private $id;
    private $username;
    private $email;
    private $role;
    private $isAdmin;
    private $lastLogin;
    private $createdAt;
    private $updatedAt;
    private $isLoaded = false;
    
    /**
     * 构造函数
     * 
     * @param PDO $db 数据库连接
     * @param int|null $userId 用户ID
     */
    public function __construct($db, $userId = null) {
        $this->db = $db;
        
        if ($userId !== null) {
            $this->id = $userId;
            $this->load();
        }
    }
    
    /**
     * 加载用户信息
     * 
     * @return bool 是否成功
     */
    private function load() {
        if ($this->isLoaded) {
            return true;
        }
        
        try {
            $stmt = $this->db->prepare("SELECT * FROM `users` WHERE `id` = :id");
            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return false;
            }
            
            $this->username = $user['username'];
            $this->email = $user['email'];
            $this->role = $user['role'];
            $this->isAdmin = (bool)$user['is_admin'];
            $this->lastLogin = $user['last_login'];
            $this->createdAt = $user['created_at'];
            $this->updatedAt = $user['updated_at'];
            $this->isLoaded = true;
            
            return true;
        } catch (PDOException $e) {
            error_log("加载用户信息失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 用户登录
     * 
     * @param string $username 用户名
     * @param string $password 密码
     * @return bool 是否成功
     */
    public function login($username, $password) {
        try {
            // 检查登录尝试次数
            if (!$this->checkLoginAttempts($username)) {
                return false;
            }
            
            // 查询用户
            $stmt = $this->db->prepare("SELECT * FROM `users` WHERE `username` = :username OR `email` = :email");
            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
            $stmt->bindParam(':email', $username, PDO::PARAM_STR);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                $this->recordLoginAttempt($username, false);
                return false;
            }
            
            // 验证密码
            if (!password_verify($password, $user['password'])) {
                $this->recordLoginAttempt($username, false);
                return false;
            }
            
            // 更新登录信息
            $this->id = $user['id'];
            $this->username = $user['username'];
            $this->email = $user['email'];
            $this->role = $user['role'];
            $this->isAdmin = (bool)$user['is_admin'];
            $this->lastLogin = date('Y-m-d H:i:s');
            $this->createdAt = $user['created_at'];
            $this->updatedAt = $user['updated_at'];
            $this->isLoaded = true;
            
            // 更新最后登录时间
            $stmt = $this->db->prepare("UPDATE `users` SET `last_login` = :last_login WHERE `id` = :id");
            $stmt->bindParam(':last_login', $this->lastLogin, PDO::PARAM_STR);
            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->execute();
            
            // 记录登录成功
            $this->recordLoginAttempt($username, true);
            
            // 设置会话
            $_SESSION['user_id'] = $this->id;
            $_SESSION['username'] = $this->username;
            $_SESSION['is_admin'] = $this->isAdmin;
            
            // 记录日志
            Logger::info('用户登录成功', ['user_id' => $this->id, 'username' => $this->username]);
            
            return true;
        } catch (PDOException $e) {
            error_log("用户登录失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 检查登录尝试次数
     * 
     * @param string $username 用户名
     * @return bool 是否允许登录
     */
    private function checkLoginAttempts($username) {
        try {
            // 获取设置
            $settings = new Settings($this->db);
            $maxAttempts = (int)$settings->getSetting('security', 'login_attempts', 5);
            $timeout = (int)$settings->getSetting('security', 'login_timeout', 30);
            
            // 查询登录尝试记录
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM `login_attempts` WHERE `username` = :username AND `success` = 0 AND `created_at` > DATE_SUB(NOW(), INTERVAL :timeout MINUTE)");
            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
            $stmt->bindParam(':timeout', $timeout, PDO::PARAM_INT);
            $stmt->execute();
            $attempts = $stmt->fetchColumn();
            
            return $attempts < $maxAttempts;
        } catch (PDOException $e) {
            error_log("检查登录尝试次数失败: " . $e->getMessage());
            return true;
        }
    }
    
    /**
     * 记录登录尝试
     * 
     * @param string $username 用户名
     * @param bool $success 是否成功
     */
    private function recordLoginAttempt($username, $success) {
        try {
            $stmt = $this->db->prepare("INSERT INTO `login_attempts` (`username`, `success`, `ip`, `user_agent`) VALUES (:username, :success, :ip, :user_agent)");
            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
            $stmt->bindParam(':success', $success, PDO::PARAM_BOOL);
            $stmt->bindParam(':ip', $_SERVER['REMOTE_ADDR'], PDO::PARAM_STR);
            $stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT'], PDO::PARAM_STR);
            $stmt->execute();
        } catch (PDOException $e) {
            error_log("记录登录尝试失败: " . $e->getMessage());
        }
    }
    
    /**
     * 用户注册
     * 
     * @param string $username 用户名
     * @param string $email 邮箱
     * @param string $password 密码
     * @return bool 是否成功
     */
    public function register($username, $email, $password) {
        try {
            // 检查用户名和邮箱是否已存在
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM `users` WHERE `username` = :username OR `email` = :email");
            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
            $stmt->bindParam(':email', $email, PDO::PARAM_STR);
            $stmt->execute();
            
            if ($stmt->fetchColumn() > 0) {
                return false;
            }
            
            // 获取密码策略
            $settings = new Settings($this->db);
            $minLength = (int)$settings->getSetting('security', 'password_min_length', 8);
            $requireUppercase = (bool)$settings->getSetting('security', 'password_require_uppercase', true);
            $requireNumber = (bool)$settings->getSetting('security', 'password_require_number', true);
            $requireSpecial = (bool)$settings->getSetting('security', 'password_require_special', true);
            
            // 验证密码
            if (strlen($password) < $minLength) {
                return false;
            }
            
            if ($requireUppercase && !preg_match('/[A-Z]/', $password)) {
                return false;
            }
            
            if ($requireNumber && !preg_match('/[0-9]/', $password)) {
                return false;
            }
            
            if ($requireSpecial && !preg_match('/[^A-Za-z0-9]/', $password)) {
                return false;
            }
            
            // 加密密码
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // 插入用户
            $stmt = $this->db->prepare("INSERT INTO `users` (`username`, `email`, `password`, `role`, `is_admin`, `created_at`, `updated_at`) VALUES (:username, :email, :password, 'user', 0, NOW(), NOW())");
            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
            $stmt->bindParam(':email', $email, PDO::PARAM_STR);
            $stmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
            $stmt->execute();
            
            $this->id = $this->db->lastInsertId();
            $this->username = $username;
            $this->email = $email;
            $this->role = 'user';
            $this->isAdmin = false;
            $this->createdAt = date('Y-m-d H:i:s');
            $this->updatedAt = date('Y-m-d H:i:s');
            $this->isLoaded = true;
            
            // 记录日志
            Logger::info('用户注册成功', ['user_id' => $this->id, 'username' => $this->username]);
            
            return true;
        } catch (PDOException $e) {
            error_log("用户注册失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 更新用户信息
     * 
     * @param array $data 用户数据
     * @return bool 是否成功
     */
    public function update($data) {
        if (!$this->isLoaded) {
            return false;
        }
        
        try {
            $updates = [];
            $params = [];
            
            foreach ($data as $key => $value) {
                if ($key === 'id' || $key === 'password' || $key === 'role' || $key === 'is_admin') {
                    continue;
                }
                
                $updates[] = "`{$key}` = :{$key}";
                $params[$key] = $value;
            }
            
            if (empty($updates)) {
                return true;
            }
            
            $updates[] = "`updated_at` = NOW()";
            $params['id'] = $this->id;
            
            $sql = "UPDATE `users` SET " . implode(', ', $updates) . " WHERE `id` = :id";
            $stmt = $this->db->prepare($sql);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue(":{$key}", $value);
            }
            
            $stmt->execute();
            
            // 更新本地数据
            foreach ($data as $key => $value) {
                if (property_exists($this, $key)) {
                    $this->$key = $value;
                }
            }
            
            $this->updatedAt = date('Y-m-d H:i:s');
            
            // 记录日志
            Logger::info('用户信息更新成功', ['user_id' => $this->id, 'username' => $this->username]);
            
            return true;
        } catch (PDOException $e) {
            error_log("更新用户信息失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 更新密码
     * 
     * @param string $oldPassword 旧密码
     * @param string $newPassword 新密码
     * @return bool 是否成功
     */
    public function updatePassword($oldPassword, $newPassword) {
        if (!$this->isLoaded) {
            return false;
        }
        
        try {
            // 验证旧密码
            $stmt = $this->db->prepare("SELECT `password` FROM `users` WHERE `id` = :id");
            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!password_verify($oldPassword, $user['password'])) {
                return false;
            }
            
            // 获取密码策略
            $settings = new Settings($this->db);
            $minLength = (int)$settings->getSetting('security', 'password_min_length', 8);
            $requireUppercase = (bool)$settings->getSetting('security', 'password_require_uppercase', true);
            $requireNumber = (bool)$settings->getSetting('security', 'password_require_number', true);
            $requireSpecial = (bool)$settings->getSetting('security', 'password_require_special', true);
            
            // 验证新密码
            if (strlen($newPassword) < $minLength) {
                return false;
            }
            
            if ($requireUppercase && !preg_match('/[A-Z]/', $newPassword)) {
                return false;
            }
            
            if ($requireNumber && !preg_match('/[0-9]/', $newPassword)) {
                return false;
            }
            
            if ($requireSpecial && !preg_match('/[^A-Za-z0-9]/', $newPassword)) {
                return false;
            }
            
            // 加密新密码
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            // 更新密码
            $stmt = $this->db->prepare("UPDATE `users` SET `password` = :password, `updated_at` = NOW() WHERE `id` = :id");
            $stmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->execute();
            
            // 记录日志
            Logger::info('用户密码更新成功', ['user_id' => $this->id, 'username' => $this->username]);
            
            return true;
        } catch (PDOException $e) {
            error_log("更新用户密码失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 检查用户是否有权限
     * 
     * @param string $permission 权限
     * @return bool 是否有权限
     */
    public function hasPermission($permission) {
        if (!$this->isLoaded) {
            return false;
        }
        
        // 管理员拥有所有权限
        if ($this->isAdmin) {
            return true;
        }
        
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM `permissions` p JOIN `role_permissions` rp ON p.id = rp.permission_id JOIN `roles` r ON rp.role_id = r.id WHERE r.name = :role AND p.name = :permission");
            $stmt->bindParam(':role', $this->role, PDO::PARAM_STR);
            $stmt->bindParam(':permission', $permission, PDO::PARAM_STR);
            $stmt->execute();
            
            return $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("检查用户权限失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 获取用户ID
     * 
     * @return int|null 用户ID
     */
    public function getId() {
        return $this->id;
    }
    
    /**
     * 获取用户名
     * 
     * @return string|null 用户名
     */
    public function getUsername() {
        return $this->username;
    }
    
    /**
     * 获取邮箱
     * 
     * @return string|null 邮箱
     */
    public function getEmail() {
        return $this->email;
    }
    
    /**
     * 获取角色
     * 
     * @return string|null 角色
     */
    public function getRole() {
        return $this->role;
    }
    
    /**
     * 是否是管理员
     * 
     * @return bool 是否是管理员
     */
    public function isAdmin() {
        return $this->isAdmin;
    }
    
    /**
     * 获取最后登录时间
     * 
     * @return string|null 最后登录时间
     */
    public function getLastLogin() {
        return $this->lastLogin;
    }
    
    /**
     * 获取创建时间
     * 
     * @return string|null 创建时间
     */
    public function getCreatedAt() {
        return $this->createdAt;
    }
    
    /**
     * 获取更新时间
     * 
     * @return string|null 更新时间
     */
    public function getUpdatedAt() {
        return $this->updatedAt;
    }
    
    /**
     * 获取用户信息
     * 
     * @return array 用户信息
     */
    public function toArray() {
        if (!$this->isLoaded) {
            return [];
        }
        
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'is_admin' => $this->isAdmin,
            'last_login' => $this->lastLogin,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }
} 