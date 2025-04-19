<?php
/**
 * CSRF Token生成API
 */
require_once __DIR__ . '/../../includes/init.php';

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    // 生成新的CSRF Token
    $token = $security->generateCsrfToken();
    
    // 返回成功响应
    echo json_encode([
        'success' => true,
        'token' => $token
    ]);

} catch (Exception $e) {
    // 设置HTTP状态码
    http_response_code(500);
    
    // 返回错误响应
    echo json_encode([
        'success' => false,
        'message' => '生成CSRF Token失败'
    ]);
    
    // 记录错误日志
    $logger->error('生成CSRF Token失败', [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} 