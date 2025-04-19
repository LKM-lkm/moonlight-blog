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

// 错误报告设置
error_reporting(E_ALL);
ini_set('display_errors', DEBUG_MODE ? 1 : 0);
ini_set('log_errors', 1);
ini_set('error_log', LOG_FILE);

// 加载常量定义
require_once __DIR__ . '/constants.php';

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

// 自动加载类
spl_autoload_register(function ($class) {
    $paths = [
        INCLUDES_PATH,
        ROOT_PATH . '/includes',
        ADMIN_PATH . '/includes'
    ];

    foreach ($paths as $path) {
        $file = $path . '/' . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// 启动会话
session_name(SESSION_NAME);
session_set_cookie_params(
    SESSION_LIFETIME,
    SESSION_PATH,
    SESSION_DOMAIN,
    SESSION_SECURE,
    SESSION_HTTPONLY
);
session_start();

// 检查会话过期
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > SESSION_LIFETIME)) {
    session_unset();
    session_destroy();
    session_start();
}
$_SESSION['last_activity'] = time();

// 初始化数据库连接
try {
    $db = Database::getInstance();
} catch (Exception $e) {
    error_log('数据库连接失败: ' . $e->getMessage());
    die('系统维护中，请稍后再试');
}

// 初始化安全实例
$security = Security::getInstance();

// 初始化日志实例
$logger = Logger::getInstance($db->getConnection());

// 初始化认证实例
$auth = Auth::getInstance();

// 过滤输入数据
$_GET = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING) ?? [];
$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING) ?? [];

// CSRF保护
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST[CSRF_TOKEN_NAME]) || !$security->validateCsrfToken($_POST[CSRF_TOKEN_NAME])) {
        http_response_code(403);
        die('无效的请求');
    }
}

// 记录请求
$logger->info('收到请求', [
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'ip' => $security->getClientIp(),
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
]);

// 返回配置
return [
    'db' => $db,
    'security' => $security,
    'logger' => $logger,
    'auth' => $auth
]; 