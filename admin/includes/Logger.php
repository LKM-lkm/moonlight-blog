<?php
/**
 * 日志类
 * 
 * 记录系统活动，包括：
 * - 用户操作
 * - 系统错误
 * - 安全事件
 * - 性能监控
 */

class Logger {
    private $db;
    private $logFile;
    private $logLevel;
    private static $instance = null;
    
    // 日志级别
    const LEVEL_DEBUG = 'debug';
    const LEVEL_INFO = 'info';
    const LEVEL_WARNING = 'warning';
    const LEVEL_ERROR = 'error';
    const LEVEL_CRITICAL = 'critical';
    
    /**
     * 构造函数
     * 
     * @param PDO $db 数据库连接
     */
    private function __construct($db) {
        $this->db = $db;
        $this->logFile = dirname(__DIR__) . '/logs/app.log';
        $this->logLevel = self::LEVEL_INFO;
        
        // 确保日志目录存在
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    /**
     * 获取实例
     * 
     * @param PDO $db 数据库连接
     * @return Logger 日志实例
     */
    public static function getInstance($db) {
        if (self::$instance === null) {
            self::$instance = new self($db);
        }
        return self::$instance;
    }
    
    /**
     * 设置日志级别
     * 
     * @param string $level 日志级别
     */
    public function setLogLevel($level) {
        $this->logLevel = $level;
    }
    
    /**
     * 记录调试日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    public static function debug($message, $context = []) {
        self::log(self::LEVEL_DEBUG, $message, $context);
    }
    
    /**
     * 记录信息日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    public static function info($message, $context = []) {
        self::log(self::LEVEL_INFO, $message, $context);
    }
    
    /**
     * 记录警告日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    public static function warning($message, $context = []) {
        self::log(self::LEVEL_WARNING, $message, $context);
    }
    
    /**
     * 记录错误日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    public static function error($message, $context = []) {
        self::log(self::LEVEL_ERROR, $message, $context);
    }
    
    /**
     * 记录严重错误日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    public static function critical($message, $context = []) {
        self::log(self::LEVEL_CRITICAL, $message, $context);
    }
    
    /**
     * 记录日志
     * 
     * @param string $level 日志级别
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    private static function log($level, $message, $context = []) {
        $db = Database::getInstance()->getConnection();
        $logger = self::getInstance($db);
        
        // 检查日志级别
        if (!$logger->shouldLog($level)) {
            return;
        }
        
        // 格式化日志消息
        $logMessage = $logger->formatMessage($level, $message, $context);
        
        // 写入日志文件
        $logger->writeToFile($logMessage);
        
        // 写入数据库
        $logger->writeToDatabase($level, $message, $context);
    }
    
    /**
     * 检查是否应该记录日志
     * 
     * @param string $level 日志级别
     * @return bool 是否应该记录日志
     */
    private function shouldLog($level) {
        $levels = [
            self::LEVEL_DEBUG => 0,
            self::LEVEL_INFO => 1,
            self::LEVEL_WARNING => 2,
            self::LEVEL_ERROR => 3,
            self::LEVEL_CRITICAL => 4
        ];
        
        return $levels[$level] >= $levels[$this->logLevel];
    }
    
    /**
     * 格式化日志消息
     * 
     * @param string $level 日志级别
     * @param string $message 日志消息
     * @param array $context 上下文信息
     * @return string 格式化后的日志消息
     */
    private function formatMessage($level, $message, $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $level = strtoupper($level);
        
        // 替换消息中的占位符
        if (!empty($context)) {
            $message = $this->interpolate($message, $context);
        }
        
        return sprintf('[%s] [%s] %s', $timestamp, $level, $message);
    }
    
    /**
     * 替换消息中的占位符
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     * @return string 替换后的日志消息
     */
    private function interpolate($message, $context = []) {
        $replace = [];
        
        foreach ($context as $key => $val) {
            if (!is_array($val) && (!is_object($val) || method_exists($val, '__toString'))) {
                $replace['{' . $key . '}'] = $val;
            }
        }
        
        return strtr($message, $replace);
    }
    
    /**
     * 写入日志到文件
     * 
     * @param string $message 日志消息
     */
    private function writeToFile($message) {
        file_put_contents($this->logFile, $message . PHP_EOL, FILE_APPEND);
    }
    
    /**
     * 写入日志到数据库
     * 
     * @param string $level 日志级别
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    private function writeToDatabase($level, $message, $context = []) {
        try {
            $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $url = $_SERVER['REQUEST_URI'] ?? '';
            
            $data = [
                'level' => $level,
                'message' => $message,
                'context' => json_encode($context),
                'user_id' => $userId,
                'ip' => $ip,
                'user_agent' => $userAgent,
                'url' => $url,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            $this->db->insert('logs', $data);
        } catch (Exception $e) {
            error_log('写入日志到数据库失败: ' . $e->getMessage());
        }
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