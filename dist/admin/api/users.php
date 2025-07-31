<?php
/**
 * 用户管理API
 * 
 * 功能包括：
 * - 获取用户列表（支持分页、搜索和过滤）
 * - 获取单个用户信息
 * - 创建用户
 * - 更新用户
 * - 删除用户
 * - 重置用户密码
 */

// 引入必要的文件
require_once '../includes/init.php';
require_once '../includes/Auth.php';

// 检查是否已登录
$auth = new Auth($db);
if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => '未登录或会话已过期'
    ]);
    exit;
}

// 检查是否有权限
if (!$auth->hasPermission('manage_users')) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => '没有权限执行此操作'
    ]);
    exit;
}

// 获取请求方法和路径
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// 检查API版本和资源
if (count($pathParts) < 3 || $pathParts[1] !== 'api' || $pathParts[2] !== 'users') {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'API资源不存在'
    ]);
    exit;
}

// 处理请求
switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getUser($_GET['id']);
        } else {
            getUsers();
        }
        break;
    case 'POST':
        createUser();
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            updateUser($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '缺少用户ID'
            ]);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteUser($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '缺少用户ID'
            ]);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => '不支持的请求方法'
        ]);
}

/**
 * 获取用户列表
 */
function getUsers() {
    global $db;
    
    // 获取查询参数
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $role = isset($_GET['role']) ? trim($_GET['role']) : '';
    $status = isset($_GET['status']) ? (int)$_GET['status'] : -1;
    
    // 构建查询条件
    $where = [];
    $params = [];
    
    if (!empty($search)) {
        $where[] = "(username LIKE ? OR email LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if (!empty($role)) {
        $where[] = "role = ?";
        $params[] = $role;
    }
    
    if ($status !== -1) {
        $where[] = "status = ?";
        $params[] = $status;
    }
    
    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
    
    // 获取总记录数
    $countSql = "SELECT COUNT(*) FROM users $whereClause";
    $stmt = $db->prepare($countSql);
    $stmt->execute($params);
    $total = $stmt->fetchColumn();
    
    // 计算总页数
    $totalPages = ceil($total / $limit);
    
    // 获取用户列表
    $offset = ($page - 1) * $limit;
    $sql = "SELECT id, username, email, role, status, avatar, bio, last_login, created_at, updated_at 
            FROM users $whereClause 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?";
    
    $stmt = $db->prepare($sql);
    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 返回结果
    echo json_encode([
        'success' => true,
        'users' => $users,
        'total' => $total,
        'pages' => $totalPages,
        'current_page' => $page
    ]);
}

/**
 * 获取单个用户信息
 * 
 * @param int $id 用户ID
 */
function getUser($id) {
    global $db;
    
    $stmt = $db->prepare("SELECT id, username, email, role, status, avatar, bio, last_login, created_at, updated_at FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => '用户不存在'
        ]);
        return;
    }
    
    // 获取用户权限
    $stmt = $db->prepare("SELECT permission FROM user_permissions WHERE user_id = ?");
    $stmt->execute([$id]);
    $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $user['permissions'] = $permissions;
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
}

/**
 * 创建用户
 */
function createUser() {
    global $db, $auth;
    
    // 获取请求数据
    $data = json_decode(file_get_contents('php://input'), true);
    
    // 验证数据
    if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '请填写所有必填字段'
        ]);
        return;
    }
    
    // 验证用户名
    if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $data['username'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '用户名只能包含字母、数字和下划线，长度3-20个字符'
        ]);
        return;
    }
    
    // 验证邮箱
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '邮箱格式不正确'
        ]);
        return;
    }
    
    // 验证密码强度
    if (strlen($data['password']) < 8) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '密码长度至少8个字符'
        ]);
        return;
    }
    
    // 验证角色
    if (!empty($data['role']) && !in_array($data['role'], ['admin', 'editor', 'user'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '无效的角色'
        ]);
        return;
    }
    
    // 检查用户名和邮箱是否已存在
    $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$data['username'], $data['email']]);
    $count = $stmt->fetchColumn();
    
    if ($count > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '用户名或邮箱已存在'
        ]);
        return;
    }
    
    // 创建用户
    $stmt = $db->prepare("INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
    $stmt->execute([
        $data['username'],
        $data['email'],
        password_hash($data['password'], PASSWORD_DEFAULT),
        $data['role'] ?? 'user',
        $data['status'] ?? 1
    ]);
    
    $userId = $db->lastInsertId();
    
    // 添加默认权限
    addDefaultPermissions($userId, $data['role'] ?? 'user');
    
    // 记录日志
    logUserAction('create', $userId, $data['username']);
    
    echo json_encode([
        'success' => true,
        'message' => '用户创建成功',
        'user_id' => $userId
    ]);
}

/**
 * 更新用户
 * 
 * @param int $id 用户ID
 */
function updateUser($id) {
    global $db, $auth;
    
    // 获取请求数据
    $data = json_decode(file_get_contents('php://input'), true);
    
    // 检查用户是否存在
    $stmt = $db->prepare("SELECT id, username, role FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => '用户不存在'
        ]);
        return;
    }
    
    // 不允许修改自己的角色
    if ($user['id'] === $auth->getUserInfo()['id'] && isset($data['role'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '不能修改自己的角色'
        ]);
        return;
    }
    
    // 构建更新字段
    $updates = [];
    $params = [];
    
    if (isset($data['username'])) {
        // 验证用户名
        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $data['username'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '用户名只能包含字母、数字和下划线，长度3-20个字符'
            ]);
            return;
        }
        
        // 检查用户名是否已存在
        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$data['username'], $id]);
        if ($stmt->fetchColumn() > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '用户名已存在'
            ]);
            return;
        }
        
        $updates[] = "username = ?";
        $params[] = $data['username'];
    }
    
    if (isset($data['email'])) {
        // 验证邮箱
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '邮箱格式不正确'
            ]);
            return;
        }
        
        // 检查邮箱是否已存在
        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$data['email'], $id]);
        if ($stmt->fetchColumn() > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '邮箱已存在'
            ]);
            return;
        }
        
        $updates[] = "email = ?";
        $params[] = $data['email'];
    }
    
    if (isset($data['password'])) {
        // 验证密码强度
        if (strlen($data['password']) < 8) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '密码长度至少8个字符'
            ]);
            return;
        }
        
        $updates[] = "password = ?";
        $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }
    
    if (isset($data['role'])) {
        // 验证角色
        if (!in_array($data['role'], ['admin', 'editor', 'user'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '无效的角色'
            ]);
            return;
        }
        
        $updates[] = "role = ?";
        $params[] = $data['role'];
        
        // 更新权限
        updateUserPermissions($id, $data['role']);
    }
    
    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $params[] = $data['status'];
    }
    
    if (isset($data['avatar'])) {
        $updates[] = "avatar = ?";
        $params[] = $data['avatar'];
    }
    
    if (isset($data['bio'])) {
        $updates[] = "bio = ?";
        $params[] = $data['bio'];
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '没有要更新的数据'
        ]);
        return;
    }
    
    // 更新用户
    $params[] = $id;
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // 记录日志
    logUserAction('update', $id, $user['username']);
    
    echo json_encode([
        'success' => true,
        'message' => '用户更新成功'
    ]);
}

/**
 * 删除用户
 * 
 * @param int $id 用户ID
 */
function deleteUser($id) {
    global $db, $auth;
    
    // 检查用户是否存在
    $stmt = $db->prepare("SELECT id, username FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => '用户不存在'
        ]);
        return;
    }
    
    // 不允许删除自己
    if ($user['id'] === $auth->getUserInfo()['id']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '不能删除自己的账户'
        ]);
        return;
    }
    
    // 删除用户
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    
    // 记录日志
    logUserAction('delete', $id, $user['username']);
    
    echo json_encode([
        'success' => true,
        'message' => '用户删除成功'
    ]);
}

/**
 * 添加默认权限
 * 
 * @param int $userId 用户ID
 * @param string $role 用户角色
 */
function addDefaultPermissions($userId, $role) {
    global $db;
    
    $permissions = [];
    
    switch ($role) {
        case 'admin':
            $permissions = [
                'manage_users',
                'manage_posts',
                'manage_categories',
                'manage_comments',
                'manage_settings',
                'manage_plugins',
                'manage_themes',
                'manage_media',
                'view_statistics',
                'manage_backups'
            ];
            break;
        case 'editor':
            $permissions = [
                'manage_posts',
                'manage_categories',
                'manage_comments',
                'manage_media',
                'view_statistics'
            ];
            break;
        case 'user':
            $permissions = [
                'view_posts',
                'create_comments'
            ];
            break;
    }
    
    $stmt = $db->prepare("INSERT INTO user_permissions (user_id, permission) VALUES (?, ?)");
    foreach ($permissions as $permission) {
        $stmt->execute([$userId, $permission]);
    }
}

/**
 * 更新用户权限
 * 
 * @param int $userId 用户ID
 * @param string $role 用户角色
 */
function updateUserPermissions($userId, $role) {
    global $db;
    
    // 删除现有权限
    $stmt = $db->prepare("DELETE FROM user_permissions WHERE user_id = ?");
    $stmt->execute([$userId]);
    
    // 添加新权限
    addDefaultPermissions($userId, $role);
}

/**
 * 记录用户操作日志
 * 
 * @param string $action 操作类型
 * @param int $userId 用户ID
 * @param string $username 用户名
 */
function logUserAction($action, $userId, $username) {
    global $db, $auth;
    
    $currentUser = $auth->getUserInfo();
    
    $stmt = $db->prepare("INSERT INTO user_action_logs (user_id, action, target_id, target_username, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
    $stmt->execute([
        $currentUser['id'],
        $action,
        $userId,
        $username,
        $currentUser['id']
    ]);
} 