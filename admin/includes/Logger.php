<?php

class Logger {
    private static $instance = null;
    private $logPath;
    private $config;
    
    private function __construct() {
        $this->config = require_once ROOT_PATH . '/config/config.php';
        $this->logPath = ROOT_PATH . '/logs/';
        
        if (!is_dir($this->logPath)) {
            mkdir($this->logPath, 0755, true);
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    // 写入日志
    public function log($level, $message, array $context = []) {
        if (!$this->config['log']['enabled']) {
            return false;
        }
        
        $logFile = $this->logPath . date('Y-m-d') . '.log';
        $time = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
        $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Guest';
        
        // 格式化上下文数据
        $contextStr = empty($context) ? '' : json_encode($context, JSON_UNESCAPED_UNICODE);
        
        // 格式化日志消息
        $logMessage = sprintf(
            "[%s] [%s] [%s] [User:%s] %s %s\n",
            $time,
            strtoupper($level),
            $ip,
            $userId,
            $message,
            $contextStr
        );
        
        // 写入日志文件
        return file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
    
    // 记录信息日志
    public function info($message, array $context = []) {
        return $this->log('info', $message, $context);
    }
    
    // 记录警告日志
    public function warning($message, array $context = []) {
        return $this->log('warning', $message, $context);
    }
    
    // 记录错误日志
    public function error($message, array $context = []) {
        return $this->log('error', $message, $context);
    }
    
    // 记录调试日志
    public function debug($message, array $context = []) {
        if ($this->config['debug']) {
            return $this->log('debug', $message, $context);
        }
        return false;
    }
    
    // 记录系统日志
    public function system($message, array $context = []) {
        return $this->log('system', $message, $context);
    }
    
    // 记录安全相关日志
    public function security($message, array $context = []) {
        return $this->log('security', $message, $context);
    }
    
    // 记录数据库操作日志
    public function database($message, array $context = []) {
        return $this->log('database', $message, $context);
    }
    
    // 记录API请求日志
    public function api($message, array $context = []) {
        return $this->log('api', $message, $context);
    }
    
    // 获取最近的日志
    public function getRecentLogs($lines = 100, $level = null) {
        $logFile = $this->logPath . date('Y-m-d') . '.log';
        if (!file_exists($logFile)) {
            return [];
        }
        
        $logs = [];
        $handle = fopen($logFile, 'r');
        if ($handle) {
            $position = -1;
            $line = '';
            $count = 0;
            
            while ($count < $lines && fseek($handle, $position, SEEK_END) !== -1) {
                $char = fgetc($handle);
                if ($char === false) {
                    break;
                }
                
                if ($char === "\n") {
                    if ($line !== '') {
                        if ($level === null || strpos($line, '[' . strtoupper($level) . ']') !== false) {
                            array_unshift($logs, $line);
                            $count++;
                        }
                    }
                    $line = '';
                } else {
                    $line = $char . $line;
                }
                $position--;
            }
            fclose($handle);
        }
        
        return $logs;
    }
    
    // 清理旧日志
    public function cleanOldLogs($days = 30) {
        $files = glob($this->logPath . '*.log');
        $now = time();
        
        foreach ($files as $file) {
            if (is_file($file)) {
                if ($now - filemtime($file) >= 60 * 60 * 24 * $days) {
                    unlink($file);
                }
            }
        }
    }
    
    // 获取日志统计信息
    public function getStats($days = 7) {
        $stats = [];
        $now = time();
        
        for ($i = 0; $i < $days; $i++) {
            $date = date('Y-m-d', $now - ($i * 86400));
            $logFile = $this->logPath . $date . '.log';
            
            $stats[$date] = [
                'info' => 0,
                'warning' => 0,
                'error' => 0,
                'debug' => 0,
                'system' => 0,
                'security' => 0,
                'database' => 0,
                'api' => 0
            ];
            
            if (file_exists($logFile)) {
                $handle = fopen($logFile, 'r');
                if ($handle) {
                    while (($line = fgets($handle)) !== false) {
                        foreach (array_keys($stats[$date]) as $level) {
                            if (strpos($line, '[' . strtoupper($level) . ']') !== false) {
                                $stats[$date][$level]++;
                                break;
                            }
                        }
                    }
                    fclose($handle);
                }
            }
        }
        
        return $stats;
    }
}