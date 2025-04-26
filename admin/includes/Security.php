<?php
/**
 * 安全类 - 处理密码验证、登录尝试记录等安全相关功能
 */
class Security {
    private static $instance = null;
    private $db;
    private $logger;
    private $config;
    
    /**
     * 私有构造函数，确保单例模式
     */
    private function __construct() {
        global $config;
        $this->config = $config;
        $this->db = Database::getInstance();
        $this->logger = Logger::getInstance();
    }
    
    /**
     * 获取单例实例
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * 生成密码哈希
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    /**
     * 验证密码
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * 记录登录失败
     */
    public function recordLoginFailure($username, $ip) {
        try {
            $stmt = $this->db->prepare("INSERT INTO user_login_logs (username, ip_address, status, created_at) VALUES (?, ?, 'failed', NOW())");
            $stmt->execute([$username, $ip]);
            
            // 检查失败次数
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM user_login_logs WHERE username = ? AND ip_address = ? AND status = 'failed' AND created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)");
            $stmt->execute([$username, $ip]);
            $result = $stmt->fetch();
            
            if ($result['count'] >= 5) {
                // 记录IP封禁
                $stmt = $this->db->prepare("INSERT INTO ip_bans (ip_address, reason, expires_at) VALUES (?, '多次登录失败', DATE_ADD(NOW(), INTERVAL 30 MINUTE))");
                $stmt->execute([$ip]);
                
                $this->logger->warning("IP {$ip} 已被封禁 30 分钟，原因：多次登录失败");
                return true; // 表示已被封禁
            }
            
            return false; // 表示未被封禁
        } catch (PDOException $e) {
            $this->logger->error("记录登录失败时发生错误: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 检查IP是否被封禁
     */
    public function isIpBanned($ip) {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM ip_bans WHERE ip_address = ? AND expires_at > NOW()");
            $stmt->execute([$ip]);
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (PDOException $e) {
            $this->logger->error("检查IP封禁状态时发生错误: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 记录登录成功
     */
    public function recordLoginSuccess($username, $ip) {
        try {
            $stmt = $this->db->prepare("INSERT INTO user_login_logs (username, ip_address, status, created_at) VALUES (?, ?, 'success', NOW())");
            $stmt->execute([$username, $ip]);
            
            // 清除该IP的失败记录
            $stmt = $this->db->prepare("DELETE FROM ip_bans WHERE ip_address = ?");
            $stmt->execute([$ip]);
        } catch (PDOException $e) {
            $this->logger->error("记录登录成功时发生错误: " . $e->getMessage());
        }
    }
    
    /**
     * 检查密码强度
     */
    public function checkPasswordStrength($password) {
        $score = 0;
        $feedback = [];

        // 检查长度
        if (strlen($password) < 8) {
            $feedback[] = '密码长度至少需要8个字符';
        } else {
            $score += 2;
        }

        // 检查是否包含数字
        if (preg_match('/\d/', $password)) {
            $score += 2;
        } else {
            $feedback[] = '密码需要包含数字';
        }

        // 检查是否包含小写字母
        if (preg_match('/[a-z]/', $password)) {
            $score += 2;
        } else {
            $feedback[] = '密码需要包含小写字母';
        }

        // 检查是否包含大写字母
        if (preg_match('/[A-Z]/', $password)) {
            $score += 2;
        } else {
            $feedback[] = '密码需要包含大写字母';
        }

        // 检查是否包含特殊字符
        if (preg_match('/[^A-Za-z0-9]/', $password)) {
            $score += 2;
        } else {
            $feedback[] = '密码需要包含特殊字符';
        }

        return [
            'score' => $score,
            'strength' => $score < 4 ? '弱' : ($score < 8 ? '中' : '强'),
            'feedback' => $feedback
        ];
    }
    
    /**
     * 生成CSRF令牌
     */
    public function generateCsrfToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    /**
     * 验证CSRF令牌
     */
    public function validateCsrfToken($token) {
        if (empty($_SESSION['csrf_token']) || empty($token)) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * XSS过滤
     */
    public function xssFilter($data) {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->xssFilter($value);
            }
        } else {
            $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        }
        return $data;
    }
    
    /**
     * SQL注入过滤
     */
    public function sqlFilter($string) {
        return addslashes($string);
    }

    /**
     * 生成随机字符串
     * @param int $length 字符串长度
     * @return string
     */
    public function generateRandomString($length = 16) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[random_int(0, strlen($characters) - 1)];
        }
        return $randomString;
    }

    /**
     * 验证输入数据
     * @param array $data 待验证的数据
     * @param array $rules 验证规则
     * @return array
     */
    public function validateInput($data, $rules) {
        $errors = [];
        foreach ($rules as $field => $rule) {
            if (!isset($data[$field])) {
                if (!empty($rule['required'])) {
                    $errors[$field] = $rule['message'] ?? "{$field}不能为空";
                }
                continue;
            }

            $value = $data[$field];

            // 验证长度
            if (isset($rule['min']) && strlen($value) < $rule['min']) {
                $errors[$field] = $rule['message'] ?? "{$field}长度不能小于{$rule['min']}";
            }
            if (isset($rule['max']) && strlen($value) > $rule['max']) {
                $errors[$field] = $rule['message'] ?? "{$field}长度不能大于{$rule['max']}";
            }

            // 验证格式
            if (isset($rule['pattern']) && !preg_match($rule['pattern'], $value)) {
                $errors[$field] = $rule['message'] ?? "{$field}格式不正确";
            }

            // 验证邮箱
            if (isset($rule['email']) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $errors[$field] = $rule['message'] ?? "邮箱格式不正确";
            }
        }

        return [
            'success' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * 记录安全事件
     * @param string $event 事件类型
     * @param array $context 事件上下文
     */
    public function logSecurityEvent($event, $context = []) {
        $context['ip'] = $_SERVER['REMOTE_ADDR'];
        $context['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
        $this->logger->warning("安全事件: {$event}", $context);
    }
}