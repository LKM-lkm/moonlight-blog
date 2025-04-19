<?php
/**
 * 日志类
 */
class Logger {
    private static $instance = null;
    private $config;
    private $logFile;
    private $logLevel;

    const EMERGENCY = 'emergency';
    const ALERT     = 'alert';
    const CRITICAL  = 'critical';
    const ERROR     = 'error';
    const WARNING   = 'warning';
    const NOTICE    = 'notice';
    const INFO      = 'info';
    const DEBUG     = 'debug';

    private $levels = [
        self::EMERGENCY => 0,
        self::ALERT     => 1,
        self::CRITICAL  => 2,
        self::ERROR     => 3,
        self::WARNING   => 4,
        self::NOTICE    => 5,
        self::INFO      => 6,
        self::DEBUG     => 7,
    ];

    private function __construct() {
        global $config;
        $this->config = $config;
        $this->logFile = $config['log']['file'] ?? __DIR__ . '/../../logs/app.log';
        $this->logLevel = $config['log']['level'] ?? self::DEBUG;
        
        // 确保日志目录存在
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * 记录日志
     * @param string $level 日志级别
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    public function log($level, $message, array $context = []) {
        if (!isset($this->levels[$level])) {
            throw new \InvalidArgumentException('无效的日志级别');
        }

        if ($this->levels[$level] > $this->levels[$this->logLevel]) {
            return;
        }

        $logEntry = $this->formatLogEntry($level, $message, $context);
        $this->write($logEntry);
    }

    /**
     * 格式化日志条目
     * @param string $level 日志级别
     * @param string $message 日志消息
     * @param array $context 上下文信息
     * @return string
     */
    private function formatLogEntry($level, $message, array $context) {
        $timestamp = date('Y-m-d H:i:s');
        $message = $this->interpolate($message, $context);
        
        $contextStr = '';
        if (!empty($context)) {
            $contextStr = ' ' . json_encode($context, JSON_UNESCAPED_UNICODE);
        }

        return sprintf(
            "[%s] %s.%s: %s%s\n",
            $timestamp,
            strtoupper($level),
            str_pad('', 9 - strlen($level)),
            $message,
            $contextStr
        );
    }

    /**
     * 替换消息中的占位符
     * @param string $message 消息模板
     * @param array $context 上下文数据
     * @return string
     */
    private function interpolate($message, array $context) {
        $replace = [];
        foreach ($context as $key => $val) {
            if (is_string($val) || method_exists($val, '__toString')) {
                $replace['{' . $key . '}'] = $val;
            }
        }
        return strtr($message, $replace);
    }

    /**
     * 写入日志
     * @param string $entry 日志条目
     */
    private function write($entry) {
        $result = file_put_contents(
            $this->logFile,
            $entry,
            FILE_APPEND | LOCK_EX
        );

        if ($result === false) {
            error_log('无法写入日志文件: ' . $this->logFile);
        }
    }

    /**
     * 清理旧日志
     * @param int $days 保留天数
     */
    public function cleanup($days = 30) {
        if (!file_exists($this->logFile)) {
            return;
        }

        $maxSize = $this->config['log']['max_size'] ?? 10 * 1024 * 1024; // 默认10MB
        $currentSize = filesize($this->logFile);

        if ($currentSize > $maxSize) {
            $backupFile = $this->logFile . '.' . date('Y-m-d-His');
            rename($this->logFile, $backupFile);
            touch($this->logFile);
            chmod($this->logFile, 0644);
        }

        // 删除超过指定天数的备份文件
        $pattern = $this->logFile . '.*';
        $backupFiles = glob($pattern);
        $now = time();
        foreach ($backupFiles as $file) {
            if (is_file($file) && ($now - filemtime($file)) > ($days * 86400)) {
                unlink($file);
            }
        }
    }

    // 便捷方法
    public function emergency($message, array $context = []) {
        $this->log(self::EMERGENCY, $message, $context);
    }

    public function alert($message, array $context = []) {
        $this->log(self::ALERT, $message, $context);
    }

    public function critical($message, array $context = []) {
        $this->log(self::CRITICAL, $message, $context);
    }

    public function error($message, array $context = []) {
        $this->log(self::ERROR, $message, $context);
    }

    public function warning($message, array $context = []) {
        $this->log(self::WARNING, $message, $context);
    }

    public function notice($message, array $context = []) {
        $this->log(self::NOTICE, $message, $context);
    }

    public function info($message, array $context = []) {
        $this->log(self::INFO, $message, $context);
    }

    public function debug($message, array $context = []) {
        $this->log(self::DEBUG, $message, $context);
    }
}