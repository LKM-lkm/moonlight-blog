<?php
/**
 * 安全类
 * 
 * 处理安全相关功能，包括：
 * - CSRF保护
 * - XSS防护
 * - SQL注入防护
 * - 密码哈希
 * - 输入验证
 */

class Security {
    private static $instance = null;
    private $csrfToken = null;
    private $csrfExpire = 7200; // 2小时
    
    /**
     * 构造函数
     */
    private function __construct() {
        $this->initCsrfToken();
    }
    
    /**
     * 获取实例
     * 
     * @return Security 安全实例
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * 初始化CSRF令牌
     */
    private function initCsrfToken() {
        if (isset($_SESSION['csrf_token'])) {
            $this->csrfToken = $_SESSION['csrf_token'];
        } else {
            $this->csrfToken = bin2hex(random_bytes(32));
            $_SESSION['csrf_token'] = $this->csrfToken;
            $_SESSION['csrf_token_time'] = time();
        }
    }
    
    /**
     * 获取CSRF令牌
     * 
     * @return string CSRF令牌
     */
    public function getCsrfToken() {
        return $this->csrfToken;
    }
    
    /**
     * 验证CSRF令牌
     * 
     * @param string $token CSRF令牌
     * @return bool 是否有效
     */
    public function validateCsrfToken($token) {
        if (empty($token) || empty($this->csrfToken)) {
            return false;
        }
        
        if (!isset($_SESSION['csrf_token_time'])) {
            return false;
        }
        
        // 检查令牌是否过期
        if (time() - $_SESSION['csrf_token_time'] > $this->csrfExpire) {
            $this->initCsrfToken();
            return false;
        }
        
        return hash_equals($this->csrfToken, $token);
    }
    
    /**
     * 生成CSRF隐藏字段
     * 
     * @return string CSRF隐藏字段HTML
     */
    public function csrfField() {
        return '<input type="hidden" name="csrf_token" value="' . $this->getCsrfToken() . '">';
    }
    
    /**
     * 过滤XSS
     * 
     * @param string $str 要过滤的字符串
     * @return string 过滤后的字符串
     */
    public function xssFilter($str) {
        if (is_array($str)) {
            foreach ($str as $key => $value) {
                $str[$key] = $this->xssFilter($value);
            }
            return $str;
        }
        
        if (is_string($str)) {
            // 移除不可见字符
            $str = preg_replace('/[\x00-\x1F\x7F]/u', '', $str);
            
            // 转换HTML实体
            $str = htmlspecialchars($str, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            
            // 移除危险的HTML标签和属性
            $str = strip_tags($str, '<p><br><b><i><u><strong><em><h1><h2><h3><h4><h5><h6><ul><ol><li><a><img><blockquote><code><pre>');
            
            return $str;
        }
        
        return $str;
    }
    
    /**
     * 过滤SQL注入
     * 
     * @param string $str 要过滤的字符串
     * @return string 过滤后的字符串
     */
    public function sqlFilter($str) {
        if (is_array($str)) {
            foreach ($str as $key => $value) {
                $str[$key] = $this->sqlFilter($value);
            }
            return $str;
        }
        
        if (is_string($str)) {
            // 移除SQL注释
            $str = preg_replace('/\/\*.*?\*\//', '', $str);
            
            // 移除SQL关键字
            $str = preg_replace('/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b/i', '', $str);
            
            // 移除SQL运算符
            $str = preg_replace('/[\'";]/', '', $str);
            
            return $str;
        }
        
        return $str;
    }
    
    /**
     * 生成密码哈希
     * 
     * @param string $password 密码
     * @return string 密码哈希
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);
    }
    
    /**
     * 验证密码
     * 
     * @param string $password 密码
     * @param string $hash 密码哈希
     * @return bool 是否匹配
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * 生成随机令牌
     * 
     * @param int $length 令牌长度
     * @return string 随机令牌
     */
    public function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    /**
     * 验证邮箱格式
     * 
     * @param string $email 邮箱
     * @return bool 是否有效
     */
    public function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * 验证URL格式
     * 
     * @param string $url URL
     * @return bool 是否有效
     */
    public function validateUrl($url) {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }
    
    /**
     * 验证IP地址格式
     * 
     * @param string $ip IP地址
     * @return bool 是否有效
     */
    public function validateIp($ip) {
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }
    
    /**
     * 获取客户端IP地址
     * 
     * @return string IP地址
     */
    public function getClientIp() {
        $ip = '';
        
        if (isset($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif (isset($_SERVER['HTTP_X_FORWARDED'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED'];
        } elseif (isset($_SERVER['HTTP_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_FORWARDED_FOR'];
        } elseif (isset($_SERVER['HTTP_FORWARDED'])) {
            $ip = $_SERVER['HTTP_FORWARDED'];
        } elseif (isset($_SERVER['REMOTE_ADDR'])) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        return $ip;
    }
    
    /**
     * 防止克隆
     */
    private function __clone() {}
    
    /**
     * 防止反序列化
     */
    private function __wakeup() {}
} 