<?php
/**
 * 登录API
 */
require_once '../../includes/init.php';

// 只允许 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => '不支持的请求方法']);
    exit;
}

// 获取并验证输入
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

// 验证 CSRF Token
$csrfToken = $input['csrf_token'] ?? '';
if (!Security::getInstance()->validateCsrfToken($csrfToken)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '无效的请求']);
    exit;
}

// 尝试登录
$auth = Auth::getInstance();
$result = $auth->login($username, $password);

// 设置响应头
header('Content-Type: application/json; charset=utf-8');

// 返回结果
echo json_encode($result); 