<?php
/**
 * 初始化文件
 * 
 * 加载所有必要的类和配置，包括：
 * - 错误处理
 * - 会话管理
 * - 数据库连接
 * - 类自动加载
 * - 安全设置
 */

// 设置错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 设置时区
date_default_timezone_set('Asia/Shanghai');

// 定义常量
define('ROOT_PATH', dirname(dirname(__DIR__)));
define('ADMIN_PATH', dirname(__DIR__));
define('INCLUDES_PATH', __DIR__);
define('CONFIG_PATH', ROOT_PATH . '/config');
define('LOGS_PATH', ROOT_PATH . '/logs');
define('UPLOADS_PATH', ROOT_PATH . '/uploads');
define('CACHE_PATH', ROOT_PATH . '/cache');

// 加载配置文件
require_once CONFIG_PATH . '/config.php';
require_once CONFIG_PATH . '/database.php';

// 注册自动加载函数
spl_autoload_register(function ($class) {
    $file = INCLUDES_PATH . '/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// 启动会话
session_start();

// 设置会话cookie参数
$secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
$httponly = true;
$samesite = 'Lax';

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => $secure,
    'httponly' => $httponly,
    'samesite' => $samesite
]);

// 初始化数据库连接
try {
    $db = Database::getInstance()->getConnection();
} catch (Exception $e) {
    die('数据库连接失败: ' . $e->getMessage());
}

// 初始化安全类
$security = Security::getInstance();

// 初始化日志类
$logger = Logger::getInstance($db);

// 初始化认证类
$auth = Auth::getInstance($db);

// 设置错误处理函数
set_error_handler(function ($errno, $errstr, $errfile, $errline) use ($logger) {
    $message = sprintf(
        '错误 [%d]: %s in %s on line %d',
        $errno,
        $errstr,
        $errfile,
        $errline
    );
    
    $logger->error($message);
    
    if (error_reporting() & $errno) {
        throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
    }
    
    return true;
});

// 设置异常处理函数
set_exception_handler(function ($exception) use ($logger) {
    $message = sprintf(
        '异常: %s in %s on line %d',
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine()
    );
    
    $logger->error($message, [
        'trace' => $exception->getTraceAsString()
    ]);
    
    if (DEBUG_MODE) {
        echo '<h1>系统错误</h1>';
        echo '<p>' . $message . '</p>';
        echo '<pre>' . $exception->getTraceAsString() . '</pre>';
    } else {
        echo '<h1>系统错误</h1>';
        echo '<p>抱歉，系统发生错误。请稍后再试。</p>';
    }
});

// 设置关闭处理函数
register_shutdown_function(function () use ($logger) {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        $message = sprintf(
            '致命错误: %s in %s on line %d',
            $error['message'],
            $error['file'],
            $error['line']
        );
        
        $logger->critical($message);
    }
});

// 过滤请求数据
$_GET = $security->xssFilter($_GET);
$_POST = $security->xssFilter($_POST);
$_COOKIE = $security->xssFilter($_COOKIE);

// 检查CSRF令牌
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!$security->validateCsrfToken($token)) {
        $logger->warning('CSRF令牌验证失败', [
            'ip' => $security->getClientIp(),
            'url' => $_SERVER['REQUEST_URI']
        ]);
        
        if (DEBUG_MODE) {
            die('CSRF令牌验证失败');
        } else {
            die('请求无效，请刷新页面重试');
        }
    }
}

// 记录请求日志
$logger->info('请求', [
    'method' => $_SERVER['REQUEST_METHOD'],
    'url' => $_SERVER['REQUEST_URI'],
    'ip' => $security->getClientIp(),
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
]);

// 返回配置
return [
    'database' => $db,
    'security' => $security,
    'logger' => $logger,
    'auth' => $auth
]; 