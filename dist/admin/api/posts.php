<?php
/**
 * 文章管理API
 */

require_once __DIR__ . '/../../includes/init.php';

header('Content-Type: application/json');

try {
    $auth = new Auth($db);
    if (!$auth->isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['error' => '未登录']);
        exit;
    }

    $user = $auth->getCurrentUser();
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            // 获取文章列表
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 10;
            $offset = ($page - 1) * $perPage;

            $posts = $db->query(
                "SELECT p.*, u.username as author_name, 
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?",
                [$perPage, $offset]
            );

            $total = $db->query("SELECT COUNT(*) as total FROM posts")[0]['total'];
            
            echo json_encode([
                'posts' => $posts,
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage
            ]);
            break;

        case 'POST':
            // 创建文章
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['title']) || empty($data['content'])) {
                throw new Exception('标题和内容不能为空');
            }

            $postId = $db->insert('posts', [
                'title' => $data['title'],
                'content' => $data['content'],
                'author_id' => $user['id'],
                'created_at' => date('Y-m-d H:i:s')
            ]);

            echo json_encode(['id' => $postId]);
            break;

        case 'PUT':
            // 更新文章
            $data = json_decode(file_get_contents('php://input'), true);
            $postId = $data['id'] ?? 0;

            if (empty($postId) || empty($data['title']) || empty($data['content'])) {
                throw new Exception('参数不完整');
            }

            // 检查文章所有权
            $post = $db->query("SELECT * FROM posts WHERE id = ?", [$postId])[0] ?? null;
            if (!$post || ($post['author_id'] != $user['id'] && $user['role'] != 'admin')) {
                throw new Exception('无权修改此文章');
            }

            $db->update('posts', [
                'title' => $data['title'],
                'content' => $data['content'],
                'updated_at' => date('Y-m-d H:i:s')
            ], ['id' => $postId]);

            echo json_encode(['success' => true]);
            break;

        case 'DELETE':
            // 删除文章
            $postId = $_GET['id'] ?? 0;
            
            if (empty($postId)) {
                throw new Exception('文章ID不能为空');
            }

            // 检查文章所有权
            $post = $db->query("SELECT * FROM posts WHERE id = ?", [$postId])[0] ?? null;
            if (!$post || ($post['author_id'] != $user['id'] && $user['role'] != 'admin')) {
                throw new Exception('无权删除此文章');
            }

            $db->delete('posts', ['id' => $postId]);
            echo json_encode(['success' => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => '不支持的请求方法']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
} 