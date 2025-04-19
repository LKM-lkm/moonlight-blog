<?php
/**
 * 用户认证和权限管理类
 * 
 * 功能包括：
 * - 用户登录和注销
 * - 用户注册
 * - 密码重置
 * - 权限验证
 * - 登录尝试限制
 * - 会话管理
 */

class Auth {
    private static $instance = null;
    private $db = null;
    private $security = null;
    private $logger = null;
    private $config = [];
    private $user = null;
    private $isLoggedIn = false;
    private $permissions = [];
    
    /**
     * 构造函数
     * 
     * @param Database $db 数据库实例
     * @param Security $security 安全实例
     * @param Logger $logger 日志实例
     */
    private function __construct() {
        $this->db = Database::getInstance();
        $this->security = Security::getInstance();
        $this->logger = Logger::getInstance();
        $this->config = require ROOT_PATH . '/config/config.php';
        $this->checkSession();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * 检查会话状态
     */
    private function checkSession() {
        if (isset($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
            $this->loadUser($userId);
        }
    }
    
    /**
     * 加载用户信息
     * 
     * @param int $userId 用户ID
     * @return bool 是否成功加载
     */
    private function loadUser($userId) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ? AND status = 1");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $this->user = $user;
            $this->isLoggedIn = true;
            $this->loadPermissions();
            return true;
        }
        
        return false;
    }
    
    /**
     * 加载用户权限
     */
    private function loadPermissions() {
        if (!$this->isLoggedIn) {
            return;
        }
        
        $stmt = $this->db->prepare("SELECT permission FROM user_permissions WHERE user_id = ?");
        $stmt->execute([$this->user['id']]);
        $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $this->permissions = $permissions;
    }
    
    /**
     * 用户登录
     * 
     * @param string $username 用户名
     * @param string $password 密码
     * @return array 登录结果
     */
    public function authenticate($username, $password) {
        try {
            // 检查登录频率限制
            $ipKey = 'login_attempts:' . $_SERVER['REMOTE_ADDR'];
            if (!$this->security->rateLimit($ipKey, 5, 300)) {
                throw new Exception('登录尝试次数过多，请稍后再试');
            }

            // 验证输入
            $username = $this->security->sanitizeInput($username);
            if (empty($username) || empty($password)) {
                throw new Exception('用户名和密码不能为空');
            }

            return $this->security->login($username, $password);
        } catch (Exception $e) {
            $this->logger->error('Authentication failed: ' . $e->getMessage(), [
                'username' => $username,
                'ip' => $_SERVER['REMOTE_ADDR']
            ]);
            throw $e;
        }
    }
    
    /**
     * 用户注册
     * 
     * @param array $data 用户数据
     * @return array 注册结果
     */
    public function register($data) {
        // 验证数据
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            return [
                'success' => false,
                'message' => '请填写所有必填字段'
            ];
        }
        
        // 验证用户名
        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $data['username'])) {
            return [
                'success' => false,
                'message' => '用户名只能包含字母、数字和下划线，长度3-20个字符'
            ];
        }
        
        // 验证邮箱
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'message' => '邮箱格式不正确'
            ];
        }
        
        // 验证密码强度
        if (strlen($data['password']) < 8) {
            return [
                'success' => false,
                'message' => '密码长度至少8个字符'
            ];
        }
        
        // 检查用户名和邮箱是否已存在
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$data['username'], $data['email']]);
        $count = $stmt->fetchColumn();
        
        if ($count > 0) {
            return [
                'success' => false,
                'message' => '用户名或邮箱已存在'
            ];
        }
        
        // 创建用户
        $stmt = $this->db->prepare("INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, 1, NOW())");
        $stmt->execute([
            $data['username'],
            $data['email'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['role'] ?? 'user'
        ]);
        
        $userId = $this->db->lastInsertId();
        
        // 添加默认权限
        $this->addDefaultPermissions($userId, $data['role'] ?? 'user');
        
        return [
            'success' => true,
            'message' => '注册成功',
            'user_id' => $userId
        ];
    }
    
    /**
     * 添加默认权限
     * 
     * @param int $userId 用户ID
     * @param string $role 用户角色
     */
    private function addDefaultPermissions($userId, $role) {
        $permissions = [];
        
        switch ($role) {
            case 'admin':
                $permissions = [
                    'manage_users',
                    'manage_posts',
                    'manage_categories',
                    'manage_comments',
                    'manage_settings',
                    'manage_plugins',
                    'manage_themes',
                    'manage_media',
                    'view_statistics',
                    'manage_backups'
                ];
                break;
            case 'editor':
                $permissions = [
                    'manage_posts',
                    'manage_categories',
                    'manage_comments',
                    'manage_media',
                    'view_statistics'
                ];
                break;
            case 'user':
                $permissions = [
                    'view_posts',
                    'create_comments'
                ];
                break;
        }
        
        $stmt = $this->db->prepare("INSERT INTO user_permissions (user_id, permission) VALUES (?, ?)");
        foreach ($permissions as $permission) {
            $stmt->execute([$userId, $permission]);
        }
    }
    
    /**
     * 重置密码
     * 
     * @param string $email 邮箱
     * @return array 重置结果
     */
    public function resetPassword($email) {
        try {
            $user = $this->db->fetch(
                "SELECT * FROM users WHERE email = ?",
                [$email]
            );

            if (!$user) {
                throw new Exception('用户不存在');
            }

            $token = $this->security->generateRandomToken();
            $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

            $this->db->insert('password_resets', [
                'user_id' => $user['id'],
                'token' => $token,
                'expires_at' => $expiry
            ]);

            // TODO: 发送重置密码邮件
            $resetLink = $this->config['site']['url'] . '/reset-password?token=' . $token;

            $this->logger->info('Password reset requested', [
                'user_id' => $user['id'],
                'email' => $email
            ]);

            return true;
        } catch (Exception $e) {
            $this->logger->error('Password reset failed: ' . $e->getMessage(), [
                'email' => $email
            ]);
            throw $e;
        }
    }
    
    /**
     * 验证重置令牌
     * 
     * @param string $token 重置令牌
     * @return array 验证结果
     */
    public function verifyResetToken($token) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW() AND status = 1");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return [
                'success' => false,
                'message' => '重置令牌无效或已过期'
            ];
        }
        
        return [
            'success' => true,
            'user_id' => $user['id']
        ];
    }
    
    /**
     * 更新密码
     * 
     * @param int $userId 用户ID
     * @param string $password 新密码
     * @return array 更新结果
     */
    public function updatePassword($userId, $password) {
        if (strlen($password) < 8) {
            return [
                'success' => false,
                'message' => '密码长度至少8个字符'
            ];
        }
        
        $stmt = $this->db->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?");
        $stmt->execute([password_hash($password, PASSWORD_DEFAULT), $userId]);
        
        return [
            'success' => true,
            'message' => '密码已更新'
        ];
    }
    
    /**
     * 检查权限
     * 
     * @param string $permission 权限名称
     * @return bool 是否有权限
     */
    public function hasPermission($permission) {
        if (!$this->isLoggedIn) {
            return false;
        }
        
        // 管理员拥有所有权限
        if ($this->user['role'] === 'admin') {
            return true;
        }
        
        return in_array($permission, $this->permissions);
    }
    
    /**
     * 检查多个权限
     * 
     * @param array $permissions 权限名称数组
     * @param string $operator 操作符：'AND' 或 'OR'
     * @return bool 是否有权限
     */
    public function hasPermissions($permissions, $operator = 'AND') {
        if (!$this->isLoggedIn) {
            return false;
        }
        
        // 管理员拥有所有权限
        if ($this->user['role'] === 'admin') {
            return true;
        }
        
        if ($operator === 'AND') {
            foreach ($permissions as $permission) {
                if (!in_array($permission, $this->permissions)) {
                    return false;
                }
            }
            return true;
        } else {
            foreach ($permissions as $permission) {
                if (in_array($permission, $this->permissions)) {
                    return true;
                }
            }
            return false;
        }
    }
    
    /**
     * 用户注销
     */
    public function logout() {
        if (isset($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
            $this->logLogin($userId, false);
        }

        // 清除所有会话数据
        session_unset();
        session_destroy();
        
        // 删除会话Cookie
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }

        return [
            'success' => true,
            'message' => '已成功退出登录'
        ];
    }
    
    /**
     * 获取当前用户信息
     * 
     * @return array|null 用户信息
     */
    public function getUserInfo() {
        if (!$this->isLoggedIn) {
            return null;
        }
        
        $userInfo = $this->user;
        unset($userInfo['password']);
        unset($userInfo['reset_token']);
        unset($userInfo['reset_token_expires']);
        
        $userInfo['permissions'] = $this->permissions;
        
        return $userInfo;
    }
    
    /**
     * 检查是否已登录
     * 
     * @return bool 是否已登录
     */
    public function isLoggedIn() {
        return $this->isLoggedIn;
    }
    
    /**
     * 获取当前用户角色
     * 
     * @return string|null 用户角色
     */
    public function getRole() {
        return $this->isLoggedIn ? $this->user['role'] : null;
    }
    
    /**
     * 检查是否是管理员
     * 
     * @return bool 是否是管理员
     */
    public function isAdmin() {
        return $this->isLoggedIn && $this->user['role'] === 'admin';
    }

    private function setUserSession($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['last_activity'] = time();
    }

    private function logLogin($userId, $isLogin = true) {
        $ip = $this->security->getClientIp();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        $stmt = $this->db->prepare('
            INSERT INTO user_login_logs (
                user_id, ip_address, user_agent, action, created_at
            ) VALUES (?, ?, ?, ?, NOW())
        ');
        
        $action = $isLogin ? 'login' : 'logout';
        $stmt->execute([$userId, $ip, $userAgent, $action]);

        $this->logger->info(
            $isLogin ? '用户登录' : '用户退出', 
            [
                'user_id' => $userId,
                'ip' => $ip,
                'user_agent' => $userAgent
            ]
        );
    }

    private function __clone() {}
    private function __wakeup() {}

    public function confirmPasswordReset($token, $newPassword) {
        try {
            $reset = $this->db->fetch(
                "SELECT * FROM password_resets 
                WHERE token = ? AND expires_at > NOW() AND used = 0",
                [$token]
            );

            if (!$reset) {
                throw new Exception('无效或已过期的重置链接');
            }

            if (!$this->security->validatePassword($newPassword)) {
                throw new Exception('新密码不符合安全要求');
            }

            $hashedPassword = $this->security->hashPassword($newPassword);

            $this->db->beginTransaction();
            try {
                $this->db->update('users',
                    ['password' => $hashedPassword],
                    'id = ?',
                    [$reset['user_id']]
                );

                $this->db->update('password_resets',
                    ['used' => 1],
                    'id = ?',
                    [$reset['id']]
                );

                $this->db->commit();
                
                $this->logger->info('Password reset completed', [
                    'user_id' => $reset['user_id']
                ]);
                
                return true;
            } catch (Exception $e) {
                $this->db->rollback();
                throw $e;
            }
        } catch (Exception $e) {
            $this->logger->error('Password reset confirmation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateLastActivity() {
        if ($this->isAuthenticated()) {
            $user = $this->getCurrentUser();
            $this->db->update('users',
                ['last_activity' => date('Y-m-d H:i:s')],
                'id = ?',
                [$user['id']]
            );
        }
    }
} 