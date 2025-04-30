<?php
/**
 * 文章管理API
 */

require_once '../includes/init.php';

header('Content-Type: application/json');

// 验证用户登录状态
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => '请先登录'
    ]);
    exit;
}

try {
    $db = Database::getInstance();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // 获取文章列表
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            $query = 'SELECT p.*, u.username, u.avatar, 
                     (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
                     FROM posts p 
                     LEFT JOIN users u ON p.user_id = u.id
                     ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
            
            $stmt = $db->prepare($query);
            $stmt->execute([$limit, $offset]);
            $posts = $stmt->fetchAll();
            
            // 获取总文章数
            $countStmt = $db->query('SELECT COUNT(*) FROM posts');
            $total = $countStmt->fetchColumn();
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'posts' => $posts,
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit
                ]
            ]);
            break;
            
        case 'POST':
            // 添加文章
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['title']) || !isset($data['content'])) {
                throw new Exception('缺少必要参数');
            }
            
            $stmt = $db->prepare('INSERT INTO posts (user_id, title, content, created_at) VALUES (?, ?, ?, NOW())');
            $stmt->execute([
                $_SESSION['user_id'],
                $data['title'],
                $data['content']
            ]);
            
            $postId = $db->lastInsertId();
            
            // 获取新添加的文章详情
            $stmt = $db->prepare('SELECT p.*, u.username, u.avatar 
                                FROM posts p 
                                LEFT JOIN users u ON p.user_id = u.id 
                                WHERE p.id = ?');
            $stmt->execute([$postId]);
            $post = $stmt->fetch();
            
            $logger->info('添加文章', [
                'user_id' => $_SESSION['user_id'],
                'post_id' => $postId
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => '文章添加成功',
                'data' => $post
            ]);
            break;
            
        case 'PUT':
            // 更新文章
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id']) || !isset($data['title']) || !isset($data['content'])) {
                throw new Exception('缺少必要参数');
            }
            
            // 验证文章所有权
            $stmt = $db->prepare('SELECT user_id FROM posts WHERE id = ?');
            $stmt->execute([$data['id']]);
            $post = $stmt->fetch();
            
            if (!$post || ($post['user_id'] != $_SESSION['user_id'] && $_SESSION['role'] !== 'admin')) {
                throw new Exception('无权修改此文章');
            }
            
            $stmt = $db->prepare('UPDATE posts SET title = ?, content = ?, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$data['title'], $data['content'], $data['id']]);
            
            $logger->info('更新文章', [
                'user_id' => $_SESSION['user_id'],
                'post_id' => $data['id']
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => '文章更新成功'
            ]);
            break;
            
        case 'DELETE':
            // 删除文章
            $postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            
            if ($postId <= 0) {
                throw new Exception('无效的文章ID');
            }
            
            // 验证文章所有权
            $stmt = $db->prepare('SELECT user_id FROM posts WHERE id = ?');
            $stmt->execute([$postId]);
            $post = $stmt->fetch();
            
            if (!$post || ($post['user_id'] != $_SESSION['user_id'] && $_SESSION['role'] !== 'admin')) {
                throw new Exception('无权删除此文章');
            }
            
            // 删除相关评论
            $stmt = $db->prepare('DELETE FROM comments WHERE post_id = ?');
            $stmt->execute([$postId]);
            
            // 删除文章
            $stmt = $db->prepare('DELETE FROM posts WHERE id = ?');
            $stmt->execute([$postId]);
            
            $logger->info('删除文章', [
                'user_id' => $_SESSION['user_id'],
                'post_id' => $postId
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => '文章删除成功'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
    }
} catch (Exception $e) {
    $logger->error('文章操作异常', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 