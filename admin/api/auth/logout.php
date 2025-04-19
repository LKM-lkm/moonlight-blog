<?php
/**
 * 登出API
 */
require_once __DIR__ . '/../../includes/init.php';

header('Content-Type: application/json; charset=utf-8');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('请求方法不允许');
    }

    // 验证CSRF Token
    $security = Security::getInstance();
    if (!$security->validateCSRF()) {
        throw new Exception('无效的请求');
    }

    // 获取认证实例
    $auth = Auth::getInstance();

    // 检查是否已登录
    if (!$auth->isAuthenticated()) {
        throw new Exception('用户未登录');
    }

    // 执行登出
    $auth->logout();

    // 返回成功响应
    echo json_encode([
        'success' => true,
        'message' => '已成功退出登录'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 