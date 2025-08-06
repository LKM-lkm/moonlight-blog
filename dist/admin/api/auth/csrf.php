<?php
/**
 * CSRF Token生成API
 */

// 禁用错误显示
ini_set('display_errors', 0);
error_reporting(0);

require_once '../../includes/init.php';

header('Content-Type: application/json');

try {
    // 生成CSRF Token
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $token;
    
    echo json_encode([
        'success' => true,
        'token' => $token
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate CSRF token'
    ]);
} 