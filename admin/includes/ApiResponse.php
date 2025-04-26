<?php
/**
 * API 响应处理类
 */
class ApiResponse {
    /**
     * 发送成功响应
     */
    public static function success($data = null, $message = '操作成功', $statusCode = 200) {
        self::send([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    /**
     * 发送错误响应
     */
    public static function error($message = '操作失败', $statusCode = 400, $debug = null) {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if (DEBUG_MODE && $debug) {
            $response['debug'] = $debug;
        }

        self::send($response, $statusCode);
    }

    /**
     * 发送响应
     */
    private static function send($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
} 