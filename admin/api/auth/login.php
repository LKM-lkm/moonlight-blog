<?php
/**
 * 登录处理API
 */

// 禁用错误显示
ini_set('display_errors', 0);
error_reporting(0);

require_once '../../includes/init.php';

header('Content-Type: application/json');

// 只允许POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

try {
    // 获取POST数据
    $data = json_decode(file_get_contents('php://input'), true);
    
    // 验证必要字段
    if (!isset($data['username']) || !isset($data['password'])) {
        throw new Exception('用户名和密码不能为空');
    }
    
    // 验证CSRF Token
    if (!isset($data['csrf_token']) || !isset($_SESSION['csrf_token']) || 
        $data['csrf_token'] !== $_SESSION['csrf_token']) {
        throw new Exception('无效的CSRF Token');
    }
    
    $username = $data['username'];
    $password = $data['password'];
    
    // TODO: 连接数据库验证用户名和密码
    // 临时使用硬编码的用户名和密码进行测试
    if ($username === 'likem' && $password === 'Lkm76@#21') {
        // 登录成功
        $_SESSION['user_id'] = 1;
        $_SESSION['username'] = $username;
        $_SESSION['is_admin'] = true;
        
        // 如果选择了"记住我"
        if (isset($data['remember']) && $data['remember']) {
            $token = bin2hex(random_bytes(32));
            setcookie('remember_token', $token, time() + 30 * 24 * 60 * 60, '/', '', true, true);
        }
        
        echo json_encode([
            'success' => true,
            'message' => '登录成功'
        ]);
    } else {
        throw new Exception('用户名或密码错误');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 