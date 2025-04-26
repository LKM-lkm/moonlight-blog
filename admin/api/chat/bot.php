<?php
/**
 * 聊天机器人API
 */
require_once __DIR__ . '/../../includes/init.php';

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    // 获取请求数据
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['message'])) {
        throw new Exception('无效的请求数据', 400);
    }

    // 预设的回复
    $responses = [
        '你好' => '你好！欢迎使用我们的在线客服。有什么可以帮到您的吗？',
        '你是谁' => '我是Moonlight博客的智能助手，可以回答您关于本站的问题，或者帮您导航至相关内容。',
        '网站' => '这是一个名为Moonlight的个人博客系统，主要分享技术文章、生活感悟和各类有趣的内容。',
        '联系' => '您可以通过页面底部的联系方式与管理员取得联系，或者发送邮件至lkm836972@outlook.com。',
        '微信' => '您可以添加博主微信号：likeme2010Ming 进行联系。',
        '最新' => '您可以点击首页的"最新文章"栏目，或者使用顶部导航栏的搜索功能，按发布日期排序。',
        '热门' => '暂无，您可以在首页的"热门推荐"栏目寻找。',
        '再见' => '感谢您的使用！如果还有其他问题，随时欢迎回来咨询。祝您有愉快的一天！',
        '谢谢' => '不客气！很高兴能帮到您。还有其他问题吗？',
        '简介' => '我是名，初三学生，热爱技术和创新，专注于绘画、文字排版，人工智能、云计算和大数据领域的研究与应用。喜欢探索新技术，用代码创造美好的数字世界。'
    ];
    
    $userMessage = trim($input['message']);
    $response = '抱歉，我暂时无法理解您的问题。请尝试询问其他问题，比如"你是谁"、"网站"等。';
    
    // 查找最匹配的问题
    foreach ($responses as $question => $answer) {
        if (strpos($userMessage, $question) !== false) {
            $response = $answer;
            break;
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => $response,
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    
    // 记录错误日志
    $logger->error('聊天机器人响应失败', [
        'error' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} 