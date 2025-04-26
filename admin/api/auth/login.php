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
        !hash_equals($_SESSION['csrf_token'], $data['csrf_token'])) {
        throw new Exception('无效的CSRF Token');
    }
    
    $username = trim($data['username']);
    $password = $data['password'];
    
    // 检查登录尝试次数
    $ip = $_SERVER['REMOTE_ADDR'];
    $now = time();
    $loginAttempts = isset($_SESSION['login_attempts'][$ip]) ? $_SESSION['login_attempts'][$ip] : 0;
    $lastAttemptTime = isset($_SESSION['login_attempt_time'][$ip]) ? $_SESSION['login_attempt_time'][$ip] : 0;
    
    // 如果超过15分钟，重置尝试次数
    if (($now - $lastAttemptTime) > 900) {
        $loginAttempts = 0;
    }
    
    if ($loginAttempts >= 5) {
        $waitTime = 900 - ($now - $lastAttemptTime);
        $logger->error('登录尝试次数过多', [
            'ip' => $ip,
            'username' => $username,
            'wait_time' => $waitTime
        ]);
        throw new Exception(sprintf('登录尝试次数过多，请等待%d分钟后再试', ceil($waitTime/60)));
    }
    
    // 连接数据库验证用户
    $db = Database::getInstance();
    $stmt = $db->prepare('SELECT id, username, password, role, status, login_attempts FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    // 验证用户状态
    if (!$user) {
        throw new Exception('用户名或密码错误');
    }
    
    if ($user['status'] !== 1) {
        throw new Exception('账户已被禁用，请联系管理员');
    }
    
    if (!password_verify($password, $user['password'])) {
        // 更新数据库中的登录尝试记录
        $stmt = $db->prepare('UPDATE users SET login_attempts = login_attempts + 1, last_attempt_time = NOW() WHERE id = ?');
        $stmt->execute([$user['id']]);
        
        // 记录失败的登录尝试
        $_SESSION['login_attempts'][$ip] = $loginAttempts + 1;
        $_SESSION['login_attempt_time'][$ip] = $now;
        
        $logger->warning('登录失败', [
            'ip' => $ip,
            'username' => $username,
            'attempts' => $loginAttempts + 1
        ]);
        
        throw new Exception('用户名或密码错误');
    }
    
    // 登录成功，重置登录尝试次数
    $stmt = $db->prepare('UPDATE users SET login_attempts = 0, last_attempt_time = NULL, last_login = NOW() WHERE id = ?');
    $stmt->execute([$user['id']]);
    
    unset($_SESSION['login_attempts'][$ip]);
    unset($_SESSION['login_attempt_time'][$ip]);
    
    // 设置会话
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['last_activity'] = time();
    
    // 如果选择了"记住我"
    if (isset($data['remember']) && $data['remember']) {
        $token = bin2hex(random_bytes(32));
        $hashedToken = password_hash($token, PASSWORD_DEFAULT);
        $expires = date('Y-m-d H:i:s', time() + 30 * 24 * 60 * 60);
        
        // 存储记住我令牌
        $stmt = $db->prepare('UPDATE users SET remember_token = ?, token_expires = ? WHERE id = ?');
        $stmt->execute([$hashedToken, $expires, $user['id']]);
        
        // 设置安全的HttpOnly cookie
        setcookie('remember_token', $token, [
            'expires' => time() + 30 * 24 * 60 * 60,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
    }
    
    $logger->info('用户登录成功', [
        'user_id' => $user['id'],
        'username' => $user['username'],
        'ip' => $ip,
        'role' => $user['role']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => '登录成功',
        'data' => [
            'username' => $user['username'],
            'role' => $user['role']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    
    $logger->error('登录异常', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'request' => [
            'ip' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT']
        ]
    ]);
} 