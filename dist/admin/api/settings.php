<?php
/**
 * 系统设置API
 * 
 * 处理前端对系统设置的请求，包括：
 * - 获取设置
 * - 保存设置
 * - 重置设置
 * - 测试邮件设置
 * - 备份管理
 */

// 设置响应头
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 如果是OPTIONS请求，直接返回
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 引入必要的文件
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/Settings.php';

// 检查管理员权限
session_start();
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    http_response_code(403);
    echo json_encode(['error' => '没有权限访问此API']);
    exit;
}

// 获取数据库连接
$db = Database::getInstance()->getConnection();

// 创建Settings实例
$settings = new Settings($db);

// 获取请求方法和路径
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim(str_replace('/admin/api/settings', '', $path), '/');

// 解析路径
$parts = explode('/', $path);
$resource = $parts[0] ?? '';
$id = $parts[1] ?? null;

// 处理请求
try {
    switch ($method) {
        case 'GET':
            if (empty($resource) || $resource === 'all') {
                // 获取所有设置
                $result = $settings->getAllSettings();
                echo json_encode(['success' => true, 'data' => $result]);
            } elseif ($resource === 'category' && isset($parts[1])) {
                // 获取指定类别的设置
                $category = $parts[1];
                $result = $settings->getSettingsByCategory($category);
                echo json_encode(['success' => true, 'data' => $result]);
            } elseif ($resource === 'backups') {
                // 获取备份列表
                $result = $settings->getBackups();
                echo json_encode(['success' => true, 'data' => $result]);
            } elseif ($resource === 'backup' && $id) {
                // 获取备份详情
                $result = $settings->getBackup($id);
                if ($result) {
                    echo json_encode(['success' => true, 'data' => $result]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => '备份不存在']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => '无效的请求']);
            }
            break;
            
        case 'POST':
            if ($resource === 'save') {
                // 保存设置
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (!$data) {
                    http_response_code(400);
                    echo json_encode(['error' => '无效的请求数据']);
                    break;
                }
                
                $result = $settings->saveSettings($data);
                
                if ($result) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => '保存设置失败']);
                }
            } elseif ($resource === 'test-email') {
                // 测试邮件设置
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (!$data) {
                    http_response_code(400);
                    echo json_encode(['error' => '无效的请求数据']);
                    break;
                }
                
                $result = $settings->testEmailSettings($data);
                
                if ($result) {
                    echo json_encode(['success' => true, 'message' => '测试邮件发送成功']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => '测试邮件发送失败']);
                }
            } elseif ($resource === 'backup') {
                // 创建备份
                $data = json_decode(file_get_contents('php://input'), true);
                $name = $data['name'] ?? '';
                $description = $data['description'] ?? '';
                
                $result = $settings->createBackup($_SESSION['user_id'], $name, $description);
                
                if ($result) {
                    echo json_encode(['success' => true, 'data' => $result]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => '创建备份失败']);
                }
            } elseif ($resource === 'restore' && $id) {
                // 恢复备份
                $result = $settings->restoreBackup($id);
                
                if ($result) {
                    echo json_encode(['success' => true, 'message' => '备份恢复成功']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => '备份恢复失败']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => '无效的请求']);
            }
            break;
            
        case 'PUT':
            if ($resource === 'reset' && isset($parts[1])) {
                // 重置设置
                $category = $parts[1];
                $result = $settings->resetSettings($category);
                
                if ($result) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => '重置设置失败']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => '无效的请求']);
            }
            break;
            
        case 'DELETE':
            if ($resource === 'backup' && $id) {
                // 删除备份
                $result = $settings->deleteBackup($id);
                
                if ($result) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => '删除备份失败']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => '无效的请求']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => '不支持的请求方法']);
            break;
    }
} catch (Exception $e) {
    error_log('系统设置API错误: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => '服务器内部错误']);
} 