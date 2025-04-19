<?php
/**
 * 聊天机器人API
 */
require_once __DIR__ . '/../../includes/init.php';

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    // 获取请求数据
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['message'])) {
        throw new Exception('无效的请求数据', 400);
    }
    
    // 目前只返回"你好"
    $response = [
        'success' => true,
        'message' => '你好！欢迎来到Moonlight博客。',
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    
    // 记录错误日志
    $logger->error('聊天机器人响应失败', [
        'error' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} 