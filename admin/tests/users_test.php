<?php
/**
 * 用户管理功能测试脚本
 * 
 * 测试内容包括：
 * - 用户列表加载
 * - 用户搜索和过滤
 * - 用户创建
 * - 用户编辑
 * - 用户删除
 * - 错误处理
 */

// 引入必要的文件
require_once '../includes/init.php';

// 检查是否已登录
if (!$auth->isLoggedIn()) {
    die('请先登录');
}

// 检查是否有权限
if (!$auth->hasPermission('manage_users')) {
    die('没有权限执行此操作');
}

// 测试结果
$results = [
    'success' => [],
    'error' => []
];

// 测试用户列表加载
function testGetUsers() {
    global $db, $results;
    
    try {
        // 测试基本加载
        $stmt = $db->prepare("SELECT COUNT(*) FROM users");
        $stmt->execute();
        $total = $stmt->fetchColumn();
        
        if ($total > 0) {
            $results['success'][] = "用户列表加载成功，共有 {$total} 个用户";
        } else {
            $results['error'][] = "用户列表为空";
        }
        
        // 测试分页
        $stmt = $db->prepare("SELECT * FROM users LIMIT 5");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($users) > 0) {
            $results['success'][] = "分页功能正常";
        } else {
            $results['error'][] = "分页功能异常";
        }
        
        // 测试搜索
        $stmt = $db->prepare("SELECT * FROM users WHERE username LIKE ? LIMIT 1");
        $stmt->execute(['%admin%']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $results['success'][] = "搜索功能正常";
        } else {
            $results['error'][] = "搜索功能异常";
        }
        
        // 测试过滤
        $stmt = $db->prepare("SELECT * FROM users WHERE role = ? LIMIT 1");
        $stmt->execute(['admin']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $results['success'][] = "过滤功能正常";
        } else {
            $results['error'][] = "过滤功能异常";
        }
    } catch (Exception $e) {
        $results['error'][] = "用户列表测试失败: " . $e->getMessage();
    }
}

// 测试用户创建
function testCreateUser() {
    global $db, $results;
    
    try {
        // 生成随机用户名和邮箱
        $username = 'test_' . uniqid();
        $email = $username . '@example.com';
        $password = 'Test123456';
        $role = 'user';
        $status = 1;
        
        // 创建用户
        $stmt = $db->prepare("INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([
            $username,
            $email,
            password_hash($password, PASSWORD_DEFAULT),
            $role,
            $status
        ]);
        
        $userId = $db->lastInsertId();
        
        // 验证用户是否创建成功
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $results['success'][] = "用户创建成功: {$username}";
            
            // 添加默认权限
            $stmt = $db->prepare("INSERT INTO user_permissions (user_id, permission) VALUES (?, ?)");
            $stmt->execute([$userId, 'view_posts']);
            $stmt->execute([$userId, 'create_comments']);
            
            // 返回用户ID用于后续测试
            return $userId;
        } else {
            $results['error'][] = "用户创建失败";
            return null;
        }
    } catch (Exception $e) {
        $results['error'][] = "用户创建测试失败: " . $e->getMessage();
        return null;
    }
}

// 测试用户编辑
function testUpdateUser($userId) {
    global $db, $results;
    
    if (!$userId) {
        $results['error'][] = "无法测试用户编辑，因为用户创建失败";
        return;
    }
    
    try {
        // 更新用户信息
        $newUsername = 'updated_' . uniqid();
        $newEmail = $newUsername . '@example.com';
        
        $stmt = $db->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
        $stmt->execute([$newUsername, $newEmail, $userId]);
        
        // 验证用户是否更新成功
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && $user['username'] === $newUsername && $user['email'] === $newEmail) {
            $results['success'][] = "用户编辑成功: {$newUsername}";
        } else {
            $results['error'][] = "用户编辑失败";
        }
    } catch (Exception $e) {
        $results['error'][] = "用户编辑测试失败: " . $e->getMessage();
    }
}

// 测试用户删除
function testDeleteUser($userId) {
    global $db, $results;
    
    if (!$userId) {
        $results['error'][] = "无法测试用户删除，因为用户创建失败";
        return;
    }
    
    try {
        // 删除用户
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        
        // 验证用户是否删除成功
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            $results['success'][] = "用户删除成功";
        } else {
            $results['error'][] = "用户删除失败";
        }
    } catch (Exception $e) {
        $results['error'][] = "用户删除测试失败: " . $e->getMessage();
    }
}

// 测试错误处理
function testErrorHandling() {
    global $db, $results;
    
    try {
        // 测试无效的用户ID
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([999999]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            $results['success'][] = "无效用户ID处理正常";
        } else {
            $results['error'][] = "无效用户ID处理异常";
        }
        
        // 测试重复的用户名
        $username = 'admin';
        $email = 'test_' . uniqid() . '@example.com';
        $password = 'Test123456';
        
        try {
            $stmt = $db->prepare("INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, 'user', 1, NOW())");
            $stmt->execute([$username, $email, password_hash($password, PASSWORD_DEFAULT)]);
            $results['error'][] = "重复用户名处理异常";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                $results['success'][] = "重复用户名处理正常";
            } else {
                $results['error'][] = "重复用户名处理异常: " . $e->getMessage();
            }
        }
        
        // 测试重复的邮箱
        $username = 'test_' . uniqid();
        $email = 'admin@example.com';
        
        try {
            $stmt = $db->prepare("INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, 'user', 1, NOW())");
            $stmt->execute([$username, $email, password_hash($password, PASSWORD_DEFAULT)]);
            $results['error'][] = "重复邮箱处理异常";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                $results['success'][] = "重复邮箱处理正常";
            } else {
                $results['error'][] = "重复邮箱处理异常: " . $e->getMessage();
            }
        }
    } catch (Exception $e) {
        $results['error'][] = "错误处理测试失败: " . $e->getMessage();
    }
}

// 运行测试
testGetUsers();
$userId = testCreateUser();
testUpdateUser($userId);
testDeleteUser($userId);
testErrorHandling();

// 输出测试结果
echo "<h1>用户管理功能测试结果</h1>";
echo "<h2>成功测试 ({$results['success']})</h2>";
echo "<ul>";
foreach ($results['success'] as $result) {
    echo "<li style='color: green;'>{$result}</li>";
}
echo "</ul>";

echo "<h2>失败测试 ({$results['error']})</h2>";
echo "<ul>";
foreach ($results['error'] as $result) {
    echo "<li style='color: red;'>{$result}</li>";
}
echo "</ul>";

// 输出测试摘要
$totalTests = count($results['success']) + count($results['error']);
$successRate = $totalTests > 0 ? round(count($results['success']) / $totalTests * 100, 2) : 0;

echo "<h2>测试摘要</h2>";
echo "<p>总测试数: {$totalTests}</p>";
echo "<p>成功测试数: " . count($results['success']) . "</p>";
echo "<p>失败测试数: " . count($results['error']) . "</p>";
echo "<p>成功率: {$successRate}%</p>"; 