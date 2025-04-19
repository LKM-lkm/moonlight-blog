<?php
require_once '../../includes/init.php';

header('Content-Type: application/json');

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => '不支持的请求方法'
    ]);
    exit;
}

try {
    // 获取并验证输入
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        throw new Exception('用户名和密码不能为空');
    }

    // 尝试登录
    $result = $auth->login($username, $password);
    
    if ($result['success']) {
        // 生成新的CSRF令牌
        $result['csrf_token'] = $security->generateCsrfToken();
    }

    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 