<?php
/**
 * 登录API
 */
require_once __DIR__ . '/../../includes/init.php';

header('Content-Type: application/json; charset=utf-8');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('请求方法不允许');
    }

    // 获取POST数据
    $postData = json_decode(file_get_contents('php://input'), true);
    if (!$postData) {
        $postData = $_POST;
    }

    // 验证必要参数
    if (empty($postData['username']) || empty($postData['password'])) {
        throw new Exception('用户名和密码不能为空');
    }

    // 验证CSRF Token
    $security = Security::getInstance();
    if (!$security->validateCSRF()) {
        throw new Exception('无效的请求');
    }

    // 获取认证实例
    $auth = Auth::getInstance();

    // 尝试登录
    $auth->authenticate($postData['username'], $postData['password']);

    // 获取当前用户信息
    $user = $auth->getCurrentUser();

    // 返回成功响应
    echo json_encode([
        'success' => true,
        'message' => '登录成功',
        'data' => [
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'csrf_token' => $security->getCSRFToken()
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 