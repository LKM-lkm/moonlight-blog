<?php
/**
 * 检查登录状态API
 */
require_once __DIR__ . '/../../includes/init.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // 获取认证实例
    $auth = Auth::getInstance();
    $security = Security::getInstance();

    // 检查登录状态
    if (!$auth->isAuthenticated()) {
        throw new Exception('用户未登录');
    }

    // 获取当前用户信息
    $user = $auth->getCurrentUser();

    // 更新最后活动时间
    $auth->updateLastActivity();

    // 返回成功响应
    echo json_encode([
        'success' => true,
        'message' => '用户已登录',
        'data' => [
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'csrf_token' => $security->getCSRFToken()
        ]
    ]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 