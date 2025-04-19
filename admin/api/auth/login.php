<?php
/**
 * 登录API
 */
require_once __DIR__ . '/../../includes/init.php';

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    // 只允许POST请求
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('不支持的请求方法', 405);
    }

    // 获取请求数据
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception('无效的请求数据', 400);
    }

    // 验证必要字段
    if (empty($input['username']) || empty($input['password'])) {
        throw new Exception('用户名和密码不能为空', 400);
    }

    // 验证CSRF Token
    if (empty($input['csrf_token']) || !$security->validateCsrfToken($input['csrf_token'])) {
        throw new Exception('无效的CSRF Token', 403);
    }

    // 检查IP是否被封禁
    if ($security->isIpBanned($_SERVER['REMOTE_ADDR'])) {
        throw new Exception('由于多次登录失败，您的IP已被暂时封禁，请稍后再试', 403);
    }

    // 尝试登录
    $result = $auth->login(
        trim($input['username']),
        $input['password']
    );

    if (!$result['success']) {
        // 记录登录失败
        $security->recordLoginFailure($input['username'], $_SERVER['REMOTE_ADDR']);
        throw new Exception($result['message'], 401);
    }

    // 记录登录成功
    $security->recordLoginSuccess($input['username'], $_SERVER['REMOTE_ADDR']);

    // 设置记住我
    if (!empty($input['remember']) && $input['remember'] === true) {
        // 生成记住我的token
        $rememberToken = $security->generateRememberToken();
        $auth->setRememberToken($result['user']['id'], $rememberToken);
        
        // 设置cookie，30天有效期
        setcookie(
            'remember_token',
            $rememberToken,
            time() + (30 * 24 * 60 * 60),
            '/',
            '',
            true, // 仅HTTPS
            true  // 仅HTTP
        );
    }

    // 返回成功响应
    echo json_encode([
        'success' => true,
        'message' => '登录成功',
        'data' => [
            'username' => $result['user']['username'],
            'email' => $result['user']['email'],
            'role' => $result['user']['role']
        ]
    ]);

} catch (Exception $e) {
    // 设置HTTP状态码
    $statusCode = $e->getCode() ?: 500;
    http_response_code($statusCode);

    // 返回错误响应
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

    // 记录错误日志
    $logger->error('登录失败', [
        'error' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);
} 