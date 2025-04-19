<?php
/**
 * 安全类
 * 
 * 处理安全相关的功能，包括CSRF保护、XSS过滤等
 */
class Security {
    private static $instance = null;
    private $config;
    private $db;
    private $logger;
    private $user = null;
    
    private function __construct() {
        $this->config = require_once ROOT_PATH . '/config/config.php';
        $this->db = Database::getInstance();
        $this->logger = Logger::getInstance();
        $this->initSession();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * 构造函数
     * 
     * @param Database $db 数据库实例
     * @param Logger $logger 日志实例
     */
    public function __construct($db, $logger) {
        $this->db = $db;
        $this->logger = $logger;
    }
    
    /**
     * 生成CSRF令牌
     * 
     * @return string
     */
    public function generateCsrfToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    /**
     * 验证CSRF令牌
     * 
     * @param string $token 待验证的令牌
     * @return bool
     */
    public function validateCsrfToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * XSS过滤
     * 
     * @param mixed $data 待过滤的数据
     * @return mixed
     */
    public function xssClean($data) {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->xssClean($value);
            }
        } else {
            $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        }
        return $data;
    }
    
    /**
     * SQL注入过滤
     * 
     * @param mixed $data 待过滤的数据
     * @return mixed
     */
    public function sqlClean($data) {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->sqlClean($value);
            }
        } else {
            $data = addslashes($data);
        }
        return $data;
    }
    
    /**
     * 生成随机字符串
     * 
     * @param int $length 字符串长度
     * @return string
     */
    public function generateRandomString($length = 32) {
        return bin2hex(random_bytes($length / 2));
    }
    
    /**
     * 检查密码强度
     * 
     * @param string $password 密码
     * @return bool
     */
    public function validatePassword($password) {
        // 密码至少包含8个字符，至少一个大写字母，一个小写字母，一个数字和一个特殊字符
        return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', $password);
    }
    
    /**
     * 检查IP是否被封禁
     * 
     * @param string $ip IP地址
     * @return bool
     */
    public function isIpBanned($ip) {
        $sql = "SELECT COUNT(*) FROM banned_ips WHERE ip = ? AND expire_time > NOW()";
        return (bool)$this->db->fetchColumn($sql, [$ip]);
    }
    
    /**
     * 记录失败的登录尝试
     * 
     * @param string $username 用户名
     * @param string $ip IP地址
     */
    public function recordFailedLogin($username, $ip) {
        $this->db->insert('login_attempts', [
            'username' => $username,
            'ip' => $ip,
            'attempt_time' => date('Y-m-d H:i:s')
        ]);
        
        // 检查是否需要封禁IP
        $sql = "SELECT COUNT(*) FROM login_attempts 
                WHERE ip = ? AND attempt_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)";
        $attempts = $this->db->fetchColumn($sql, [$ip]);
        
        if ($attempts >= 5) {
            $this->db->insert('banned_ips', [
                'ip' => $ip,
                'ban_time' => date('Y-m-d H:i:s'),
                'expire_time' => date('Y-m-d H:i:s', strtotime('+1 hour')),
                'reason' => '多次登录失败'
            ]);
            
            $this->logger->warning('IP已被封禁', [
                'ip' => $ip,
                'username' => $username,
                'attempts' => $attempts
            ]);
        }
    }

    public function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    public function generateToken() {
        return bin2hex(random_bytes(32));
    }

    public function encryptData($data, $key = null) {
        $key = $key ?? $this->config['security']['encryption_key'];
        $ivLength = openssl_cipher_iv_length('AES-256-CBC');
        $iv = openssl_random_pseudo_bytes($ivLength);
        $encrypted = openssl_encrypt($data, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
        return base64_encode($iv . $encrypted);
    }

    public function decryptData($data, $key = null) {
        $key = $key ?? $this->config['security']['encryption_key'];
        $data = base64_decode($data);
        $ivLength = openssl_cipher_iv_length('AES-256-CBC');
        $iv = substr($data, 0, $ivLength);
        $encrypted = substr($data, $ivLength);
        return openssl_decrypt($encrypted, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    }

    public function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public function validateUsername($username) {
        return preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username);
    }

    public function validateIP($ip) {
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }

    public function isValidJSON($string) {
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }

    public function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    // IP地址检查
    public function checkIp($ip) {
        return filter_var($ip, FILTER_VALIDATE_IP);
    }
    
    // 请求频率限制
    public function rateLimit($key, $limit = 60, $period = 60) {
        $current = time();
        $keyName = "rate_limit:{$key}";
        
        if (isset($_SESSION[$keyName])) {
            $data = $_SESSION[$keyName];
            if ($current - $data['start'] >= $period) {
                $_SESSION[$keyName] = [
                    'count' => 1,
                    'start' => $current
                ];
                return true;
            }
            
            if ($data['count'] >= $limit) {
                return false;
            }
            
            $_SESSION[$keyName]['count']++;
            return true;
        }
        
        $_SESSION[$keyName] = [
            'count' => 1,
            'start' => $current
        ];
        return true;
    }
    
    // 文件上传安全检查
    public function validateUpload($file, $allowedTypes = [], $maxSize = 5242880) {
        if (!isset($file['error']) || is_array($file['error'])) {
            return false;
        }
        
        if ($file['size'] > $maxSize) {
            return false;
        }
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!empty($allowedTypes) && !in_array($mimeType, $allowedTypes)) {
            return false;
        }
        
        return true;
    }
    
    // 生成安全的文件名
    public function sanitizeFilename($filename) {
        $info = pathinfo($filename);
        $ext = isset($info['extension']) ? '.' . $info['extension'] : '';
        $name = isset($info['filename']) ? $info['filename'] : '';
        
        $name = preg_replace("/[^a-zA-Z0-9]/", "_", $name);
        return $name . '_' . time() . $ext;
    }
    
    // 会话安全设置
    public function secureSession() {
        ini_set('session.use_only_cookies', 1);
        ini_set('session.use_strict_mode', 1);
        
        session_set_cookie_params([
            'lifetime' => $this->config['session']['lifetime'],
            'path' => '/',
            'domain' => '',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }
    
    // 防止会话固定攻击
    public function regenerateSession() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }
    }

    private function initSession() {
        if (session_status() === PHP_SESSION_NONE) {
            $sessionConfig = $this->config['session'];
            session_name($sessionConfig['name']);
            
            session_set_cookie_params(
                $sessionConfig['lifetime'],
                $sessionConfig['path'],
                $sessionConfig['domain'],
                $sessionConfig['secure'],
                $sessionConfig['httponly']
            );
            
            session_start();
        }

        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
    }

    public function login($username, $password) {
        try {
            $sql = "SELECT u.*, GROUP_CONCAT(p.permission_name) as permissions 
                    FROM users u 
                    LEFT JOIN user_permissions up ON u.id = up.user_id 
                    LEFT JOIN permissions p ON up.permission_id = p.id 
                    WHERE u.username = ? OR u.email = ?
                    GROUP BY u.id";
            
            $user = $this->db->fetch($sql, [$username, $username]);
            
            if (!$user) {
                $this->logger->warning('Login attempt failed: User not found', ['username' => $username]);
                throw new Exception('用户名或密码错误');
            }

            if (!password_verify($password, $user['password'])) {
                $this->logger->warning('Login attempt failed: Invalid password', ['username' => $username]);
                throw new Exception('用户名或密码错误');
            }

            if (!$user['is_active']) {
                $this->logger->warning('Login attempt failed: Account inactive', ['username' => $username]);
                throw new Exception('账号已被禁用');
            }

            // 记录登录日志
            $this->db->insert('user_login_logs', [
                'user_id' => $user['id'],
                'login_ip' => $_SERVER['REMOTE_ADDR'],
                'login_time' => date('Y-m-d H:i:s'),
                'user_agent' => $_SERVER['HTTP_USER_AGENT']
            ]);

            // 更新最后登录时间
            $this->db->update('users', 
                ['last_login' => date('Y-m-d H:i:s')],
                'id = ?',
                [$user['id']]
            );

            // 设置session
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'permissions' => explode(',', $user['permissions']),
                'last_activity' => time()
            ];

            $this->user = $_SESSION['user'];
            $this->logger->info('User logged in successfully', ['username' => $username]);
            
            return true;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function logout() {
        if (isset($_SESSION['user'])) {
            $this->logger->info('User logged out', ['username' => $_SESSION['user']['username']]);
            session_destroy();
            $this->user = null;
            return true;
        }
        return false;
    }

    public function isLoggedIn() {
        if (!isset($_SESSION['user'])) {
            return false;
        }

        // 检查会话是否过期
        $timeout = $this->config['session']['lifetime'];
        if (time() - $_SESSION['user']['last_activity'] > $timeout) {
            $this->logout();
            return false;
        }

        $_SESSION['user']['last_activity'] = time();
        return true;
    }

    public function getCurrentUser() {
        return $this->isLoggedIn() ? $_SESSION['user'] : null;
    }

    public function hasPermission($permission) {
        if (!$this->isLoggedIn()) {
            return false;
        }

        if ($_SESSION['user']['role'] === 'admin') {
            return true;
        }

        return in_array($permission, $_SESSION['user']['permissions']);
    }

    public function validateCSRF() {
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }

        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? null;
        if (!$token || !hash_equals($_SESSION['csrf_token'], $token)) {
            $this->logger->warning('CSRF validation failed');
            return false;
        }

        return true;
    }

    public function getCSRFToken() {
        return $_SESSION['csrf_token'];
    }

    public function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([$this, 'sanitizeInput'], $data);
        }
        
        if (is_string($data)) {
            $data = trim($data);
            $data = stripslashes($data);
            $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        }
        
        return $data;
    }

    public function generateRandomToken($length = 32) {
        return bin2hex(random_bytes($length));
    }

    public function rateLimit($key, $limit = 60, $period = 3600) {
        $redis = new Redis();
        try {
            $redis->connect(
                $this->config['redis']['host'],
                $this->config['redis']['port']
            );

            $current = $redis->incr($key);
            if ($current === 1) {
                $redis->expire($key, $period);
            }

            if ($current > $limit) {
                $this->logger->warning('Rate limit exceeded', ['key' => $key]);
                return false;
            }

            return true;
        } catch (Exception $e) {
            $this->logger->error('Rate limiting failed: ' . $e->getMessage());
            return true; // 如果Redis不可用，默认允许请求
        } finally {
            $redis->close();
        }
    }
} 