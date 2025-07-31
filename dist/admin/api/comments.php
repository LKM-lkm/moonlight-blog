<?php
/**
 * 评论管理API
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
            // 获取评论列表
            $postId = isset($_GET['post_id']) ? (int)$_GET['post_id'] : 0;
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            $query = 'SELECT c.*, u.username, u.avatar 
                     FROM comments c 
                     LEFT JOIN users u ON c.user_id = u.id';
            $params = [];
            
            if ($postId > 0) {
                $query .= ' WHERE c.post_id = ?';
                $params[] = $postId;
            }
            
            $query .= ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $comments = $stmt->fetchAll();
            
            // 获取总评论数
            $countQuery = 'SELECT COUNT(*) FROM comments';
            if ($postId > 0) {
                $countQuery .= ' WHERE post_id = ?';
                $countStmt = $db->prepare($countQuery);
                $countStmt->execute([$postId]);
            } else {
                $countStmt = $db->query($countQuery);
            }
            $total = $countStmt->fetchColumn();
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'comments' => $comments,
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit
                ]
            ]);
            break;
            
        case 'POST':
            // 添加评论
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['post_id']) || !isset($data['content'])) {
                throw new Exception('缺少必要参数');
            }
            
            $stmt = $db->prepare('INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())');
            $stmt->execute([
                $data['post_id'],
                $_SESSION['user_id'],
                $data['content']
            ]);
            
            $commentId = $db->lastInsertId();
            
            // 获取新添加的评论详情
            $stmt = $db->prepare('SELECT c.*, u.username, u.avatar 
                                FROM comments c 
                                LEFT JOIN users u ON c.user_id = u.id 
                                WHERE c.id = ?');
            $stmt->execute([$commentId]);
            $comment = $stmt->fetch();
            
            $logger->info('添加评论', [
                'user_id' => $_SESSION['user_id'],
                'post_id' => $data['post_id'],
                'comment_id' => $commentId
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => '评论添加成功',
                'data' => $comment
            ]);
            break;
            
        case 'PUT':
            // 更新评论
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id']) || !isset($data['content'])) {
                throw new Exception('缺少必要参数');
            }
            
            // 验证评论所有权
            $stmt = $db->prepare('SELECT user_id FROM comments WHERE id = ?');
            $stmt->execute([$data['id']]);
            $comment = $stmt->fetch();
            
            if (!$comment || $comment['user_id'] != $_SESSION['user_id']) {
                throw new Exception('无权修改此评论');
            }
            
            $stmt = $db->prepare('UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$data['content'], $data['id']]);
            
            $logger->info('更新评论', [
                'user_id' => $_SESSION['user_id'],
                'comment_id' => $data['id']
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => '评论更新成功'
            ]);
            break;
            
        case 'DELETE':
            // 删除评论
            $commentId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            
            if ($commentId <= 0) {
                throw new Exception('无效的评论ID');
            }
            
            // 验证评论所有权
            $stmt = $db->prepare('SELECT user_id FROM comments WHERE id = ?');
            $stmt->execute([$commentId]);
            $comment = $stmt->fetch();
            
            if (!$comment || ($comment['user_id'] != $_SESSION['user_id'] && $_SESSION['role'] !== 'admin')) {
                throw new Exception('无权删除此评论');
            }
            
            $stmt = $db->prepare('DELETE FROM comments WHERE id = ?');
            $stmt->execute([$commentId]);
            
            $logger->info('删除评论', [
                'user_id' => $_SESSION['user_id'],
                'comment_id' => $commentId
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => '评论删除成功'
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
    $logger->error('评论操作异常', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 