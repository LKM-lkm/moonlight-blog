<?php
/**
 * 认证类
 */
class Auth {
    private $db;
    private $session;
    private $maxLoginAttempts = 5;
    private $lockoutTime = 900; // 15分钟

    public function __construct($db) {
        $this->db = $db;
        $this->session = new Session();
    }

    /**
     * 用户登录
     * @param string $username 用户名
     * @param string $password 密码
     * @param bool $remember 是否记住登录
     * @return array 登录结果
     */
    public function login($username, $password, $remember = false) {
        // 检查登录尝试次数
        if ($this->isLoginLocked()) {
            return ['success' => false, 'message' => '登录尝试次数过多，请稍后再试'];
        }

        // 获取用户信息
        $user = $this->db->getUserByUsername($username);
        if (!$user || !password_verify($password, $user['password'])) {
            $this->incrementLoginAttempts();
            return ['success' => false, 'message' => '用户名或密码错误'];
        }

        // 检查用户状态
        if ($user['status'] !== 'active') {
            return ['success' => false, 'message' => '账户已被禁用'];
        }

        // 登录成功
        $this->resetLoginAttempts();
        $this->startSession($user, $remember);
        
        return ['success' => true, 'message' => '登录成功'];
    }

    /**
     * 用户登出
     */
    public function logout() {
        $this->session->destroy();
    }

    private function isLoginLocked() {
        $attempts = $this->session->get('login_attempts', 0);
        $lastAttempt = $this->session->get('last_attempt_time', 0);
        
        if ($attempts >= $this->maxLoginAttempts && 
            (time() - $lastAttempt) < $this->lockoutTime) {
            return true;
        }
        return false;
    }

    private function incrementLoginAttempts() {
        $attempts = $this->session->get('login_attempts', 0);
        $this->session->set('login_attempts', $attempts + 1);
        $this->session->set('last_attempt_time', time());
    }

    private function resetLoginAttempts() {
        $this->session->delete('login_attempts');
        $this->session->delete('last_attempt_time');
    }

    private function startSession($user, $remember) {
        $this->session->regenerate();
        $this->session->set('user_id', $user['id']);
        $this->session->set('username', $user['username']);
        $this->session->set('role', $user['role']);

        if ($remember) {
            $token = bin2hex(random_bytes(32));
            $this->db->updateRememberToken($user['id'], $token);
            setcookie('remember_token', $token, time() + 86400 * 30, '/', '', true, true);
        }
    }

    /**
     * 检查用户是否已登录
     * @return bool
     */
    public function isLoggedIn() {
        return $this->session->has('user_id');
    }

    /**
     * 获取当前登录用户信息
     * @return array|null
     */
    public function getCurrentUser() {
        if (!$this->isLoggedIn()) {
            return null;
        }
        return [
            'id' => $this->session->get('user_id'),
            'username' => $this->session->get('username'),
            'role' => $this->session->get('role')
        ];
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