<?php
require_once __DIR__ . '/../../includes/init.php';
require_once __DIR__ . '/../../includes/Auth.php';

header('Content-Type: application/json');

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => '方法不允许']);
    exit;
}

// 获取POST数据
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '无效的请求数据']);
    exit;
}

// 验证必要字段
if (empty($data['username']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '用户名和密码不能为空']);
    exit;
}

try {
    $auth = new Auth();
    
    // 尝试登录
    $result = $auth->login($data['username'], $data['password'], isset($data['remember']) ? $data['remember'] : false);
    
    if ($result) {
        // 登录成功
        echo json_encode([
            'success' => true,
            'message' => '登录成功',
            'user' => [
                'id' => $auth->getUserId(),
                'username' => $auth->getUsername(),
                'role' => $auth->getRole()
            ]
        ]);
    } else {
        // 登录失败
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '用户名或密码错误'
        ]);
    }
} catch (Exception $e) {
    // 记录错误日志
    error_log("登录错误: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '登录过程中发生错误，请稍后重试'
    ]);
} 