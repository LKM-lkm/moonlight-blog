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
    private static $instance = null;
    private $db = null;
    private $logLevels = [
        'debug' => 0,
        'info' => 1,
        'warning' => 2,
        'error' => 3,
        'critical' => 4
    ];

    private function __construct($db) {
        $this->db = $db;
        $this->checkLogFile();
    }

    public static function getInstance($db = null) {
        if (self::$instance === null) {
            self::$instance = new self($db);
        }
        return self::$instance;
    }

    private function checkLogFile() {
        $logDir = dirname(LOG_FILE);
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }
        if (!file_exists(LOG_FILE)) {
            touch(LOG_FILE);
            chmod(LOG_FILE, 0644);
        }
    }

    private function write($level, $message, $context = []) {
        if ($this->logLevels[$level] < $this->logLevels[LOG_LEVEL]) {
            return;
        }

        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? json_encode($context, JSON_UNESCAPED_UNICODE) : '';
        
        $logMessage = sprintf(
            "[%s] %s: %s %s\n",
            $timestamp,
            strtoupper($level),
            $message,
            $contextStr
        );

        file_put_contents(LOG_FILE, $logMessage, FILE_APPEND);

        // 同时记录到数据库
        if ($this->db) {
            try {
                $stmt = $this->db->prepare('
                    INSERT INTO system_logs (level, message, context, created_at)
                    VALUES (?, ?, ?, NOW())
                ');
                $stmt->execute([$level, $message, $contextStr]);
            } catch (Exception $e) {
                // 如果数据库记录失败，至少确保写入了文件
                error_log("Failed to write log to database: " . $e->getMessage());
            }
        }
    }

    public function debug($message, $context = []) {
        $this->write('debug', $message, $context);
    }

    public function info($message, $context = []) {
        $this->write('info', $message, $context);
    }

    public function warning($message, $context = []) {
        $this->write('warning', $message, $context);
    }

    public function error($message, $context = []) {
        $this->write('error', $message, $context);
    }

    public function critical($message, $context = []) {
        $this->write('critical', $message, $context);
    }

    private function __clone() {}
    private function __wakeup() {}
} 