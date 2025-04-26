<?php
/**
 * 认证类
 */
class Auth {
    private static $instance = null;
    private $db;
    private $security;
    private $logger;
    private $config;

    private function __construct() {
        global $config;
        $this->config = $config;
        $this->db = Database::getInstance();
        $this->security = Security::getInstance();
        $this->logger = Logger::getInstance();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * 用户登录
     * @param string $username 用户名
     * @param string $password 密码
     * @return array 登录结果
     */
    public function login($username, $password) {
        try {
            // 验证输入
            if (empty($username) || empty($password)) {
                return ['success' => false, 'message' => '用户名和密码不能为空'];
            }

            // 查询用户信息
            $user = $this->db->fetch(
                "SELECT * FROM users WHERE username = ?",
                [$username]
            );

            if (!$user) {
                $this->logger->warning('登录失败：用户不存在', ['username' => $username]);
                return ['success' => false, 'message' => '用户名或密码错误'];
            }

            // 验证密码
            if (!password_verify($password, $user['password'])) {
                $this->logger->warning('登录失败：密码错误', ['username' => $username]);
                return ['success' => false, 'message' => '用户名或密码错误'];
            }

            // 更新最后登录时间
            $this->db->update('users', 
                ['last_login' => date('Y-m-d H:i:s')],
                ['id' => $user['id']]
            );

            // 记录登录日志
            $this->db->insert('user_login_logs', [
                'user_id' => $user['id'],
                'login_ip' => $_SERVER['REMOTE_ADDR'],
                'login_time' => date('Y-m-d H:i:s'),
                'user_agent' => $_SERVER['HTTP_USER_AGENT']
            ]);

            // 设置会话
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'last_active' => time()
            ];

            $this->logger->info('用户登录成功', ['username' => $username]);
            return ['success' => true, 'message' => '登录成功'];

        } catch (Exception $e) {
            $this->logger->error('登录过程发生错误', [
                'username' => $username,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'message' => '登录过程中发生错误，请稍后重试'];
        }
    }

    /**
     * 检查用户是否已登录
     * @return bool
     */
    public function isLoggedIn() {
        if (!isset($_SESSION['user'])) {
            return false;
        }

        // 检查会话是否过期
        $timeout = $this->config['session']['timeout'] ?? 1800; // 默认30分钟
        if (time() - $_SESSION['user']['last_active'] > $timeout) {
            $this->logout();
            return false;
        }

        $_SESSION['user']['last_active'] = time();
        return true;
    }

    /**
     * 用户登出
     */
    public function logout() {
        if (isset($_SESSION['user'])) {
            $this->logger->info('用户登出', ['username' => $_SESSION['user']['username']]);
            unset($_SESSION['user']);
        }
        session_destroy();
    }

    /**
     * 获取当前登录用户信息
     * @return array|null
     */
    public function getCurrentUser() {
        return $_SESSION['user'] ?? null;
    }

    /**
     * 检查用户权限
     * @param string $permission 权限标识
     * @return bool
     */
    public function hasPermission($permission) {
        if (!$this->isLoggedIn()) {
            return false;
        }

        $userId = $_SESSION['user']['id'];
        $result = $this->db->fetch(
            "SELECT COUNT(*) as count FROM user_permissions WHERE user_id = ? AND permission = ?",
            [$userId, $permission]
        );

        return $result['count'] > 0;
    }

    /**
     * 修改密码
     * @param int $userId 用户ID
     * @param string $oldPassword 旧密码
     * @param string $newPassword 新密码
     * @return array
     */
    public function changePassword($userId, $oldPassword, $newPassword) {
        try {
            $user = $this->db->fetch("SELECT * FROM users WHERE id = ?", [$userId]);
            if (!$user) {
                return ['success' => false, 'message' => '用户不存在'];
            }

            if (!password_verify($oldPassword, $user['password'])) {
                return ['success' => false, 'message' => '原密码错误'];
            }

            $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
            $this->db->update('users',
                ['password' => $hashedPassword],
                ['id' => $userId]
            );

            $this->logger->info('密码修改成功', ['user_id' => $userId]);
            return ['success' => true, 'message' => '密码修改成功'];

        } catch (Exception $e) {
            $this->logger->error('密码修改失败', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'message' => '密码修改失败，请稍后重试'];
        }
    }
}