<?php
require_once __DIR__ . '/../includes/init.php';

// 检查用户是否登录
if (!$auth->isLoggedIn()) {
    // 如果未登录，重定向到登录页面
    header('Location: ../views/login.html');
    exit;
}

// 获取用户信息
$user = $auth->getCurrentUser();

?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>仪表盘 - Moonlight</title>
    <!-- 可以在这里添加仪表盘的 CSS -->
    <style>
        body { font-family: sans-serif; padding: 20px; }
        .welcome-message { padding: 15px; background-color: #e7f3fe; border-left: 6px solid #2196F3; margin-bottom: 15px; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="welcome-message">
        欢迎回来, <?php echo htmlspecialchars($user['username'] ?? '管理员'); ?>!
    </div>

    <h1>仪表盘</h1>
    <p>这里是管理员仪表盘主页。</p>
    
    <p><a href="../api/auth/logout.php">退出登录</a></p>

    <!-- 可以在这里添加仪表盘的其他内容 -->

</body>
</html> 