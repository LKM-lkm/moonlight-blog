<?php
/**
 * 错误处理类
 */
class ErrorHandler {
    private $logger;

    public function __construct($logger) {
        $this->logger = $logger;
    }

    /**
     * 处理异常
     */
    public function handleException($e) {
        // 记录错误日志
        $this->logger->error($e->getMessage(), [
            'code' => $e->getCode(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
            'ip' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);

        // API请求返回JSON响应
        if ($this->isApiRequest()) {
            ApiResponse::error(
                DEBUG_MODE ? $e->getMessage() : '服务器内部错误',
                $e->getCode() ?: 500,
                DEBUG_MODE ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ] : null
            );
        }
        
        // 网页请求显示错误页面
        $this->displayErrorPage($e);
    }

    /**
     * 判断是否为API请求
     */
    private function isApiRequest() {
        return (
            strpos($_SERVER['REQUEST_URI'], '/api/') !== false ||
            isset($_SERVER['HTTP_X_REQUESTED_WITH']) ||
            isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false
        );
    }

    /**
     * 显示错误页面
     */
    private function displayErrorPage($e) {
        $errorMessage = DEBUG_MODE ? $e->getMessage() : '服务器内部错误，请稍后再试';
        include ADMIN_PATH . '/views/error.php';
        exit;
    }
} 