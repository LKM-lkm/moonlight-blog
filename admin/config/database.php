<?php
/**
 * 数据库配置文件
 * 
 * 包含数据库连接信息，用于Settings类和其他需要数据库连接的功能
 */

return [
    // 数据库主机
    'host' => 'localhost',
    
    // 数据库端口
    'port' => '3306',
    
    // 数据库名称
    'database' => 'moonlight_blog',
    
    // 数据库用户名
    'username' => 'root',
    
    // 数据库密码
    'password' => '',
    
    // 数据库字符集
    'charset' => 'utf8mb4',
    
    // 数据库排序规则
    'collation' => 'utf8mb4_unicode_ci',
    
    // 数据库前缀
    'prefix' => '',
    
    // 数据库选项
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
]; 