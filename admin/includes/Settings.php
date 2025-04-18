<?php
/**
 * 系统设置类
 * 
 * 处理系统设置的数据库操作，包括：
 * - 获取设置
 * - 保存设置
 * - 重置设置
 * - 备份管理
 */

class Settings {
    private $db;
    private $cache = [];
    private $cacheEnabled = true;
    private $cacheLifetime = 3600; // 默认缓存1小时
    
    /**
     * 构造函数
     * 
     * @param PDO $db 数据库连接
     */
    public function __construct($db) {
        $this->db = $db;
        
        // 从数据库加载缓存设置
        $this->loadCacheSettings();
    }
    
    /**
     * 加载缓存设置
     */
    private function loadCacheSettings() {
        try {
            $stmt = $this->db->prepare("SELECT `value` FROM `settings` WHERE `category` = 'advanced' AND `key` = 'enable_cache'");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $this->cacheEnabled = (bool)$result['value'];
            }
            
            $stmt = $this->db->prepare("SELECT `value` FROM `settings` WHERE `category` = 'advanced' AND `key` = 'cache_lifetime'");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $this->cacheLifetime = (int)$result['value'];
            }
        } catch (PDOException $e) {
            // 如果表不存在，使用默认值
            error_log("加载缓存设置失败: " . $e->getMessage());
        }
    }
    
    /**
     * 获取所有设置
     * 
     * @return array 所有设置
     */
    public function getAllSettings() {
        try {
            $stmt = $this->db->prepare("SELECT * FROM `settings`");
            $stmt->execute();
            $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $result = [];
            foreach ($settings as $setting) {
                $result[$setting['category']][$setting['key']] = $setting['value'];
            }
            
            return $result;
        } catch (PDOException $e) {
            error_log("获取所有设置失败: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * 获取指定类别的设置
     * 
     * @param string $category 设置类别
     * @return array 指定类别的设置
     */
    public function getSettingsByCategory($category) {
        // 检查缓存
        $cacheKey = "category_{$category}";
        if ($this->cacheEnabled && isset($this->cache[$cacheKey]) && $this->cache[$cacheKey]['expires'] > time()) {
            return $this->cache[$cacheKey]['data'];
        }
        
        try {
            $stmt = $this->db->prepare("SELECT * FROM `settings` WHERE `category` = :category");
            $stmt->bindParam(':category', $category, PDO::PARAM_STR);
            $stmt->execute();
            $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $result = [];
            foreach ($settings as $setting) {
                $result[$setting['key']] = $setting['value'];
            }
            
            // 设置缓存
            if ($this->cacheEnabled) {
                $this->cache[$cacheKey] = [
                    'data' => $result,
                    'expires' => time() + $this->cacheLifetime
                ];
            }
            
            return $result;
        } catch (PDOException $e) {
            error_log("获取设置失败: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * 获取单个设置
     * 
     * @param string $category 设置类别
     * @param string $key 设置键名
     * @param mixed $default 默认值
     * @return mixed 设置值
     */
    public function getSetting($category, $key, $default = null) {
        // 检查缓存
        $cacheKey = "setting_{$category}_{$key}";
        if ($this->cacheEnabled && isset($this->cache[$cacheKey]) && $this->cache[$cacheKey]['expires'] > time()) {
            return $this->cache[$cacheKey]['data'];
        }
        
        try {
            $stmt = $this->db->prepare("SELECT `value` FROM `settings` WHERE `category` = :category AND `key` = :key");
            $stmt->bindParam(':category', $category, PDO::PARAM_STR);
            $stmt->bindParam(':key', $key, PDO::PARAM_STR);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $value = $result ? $result['value'] : $default;
            
            // 设置缓存
            if ($this->cacheEnabled) {
                $this->cache[$cacheKey] = [
                    'data' => $value,
                    'expires' => time() + $this->cacheLifetime
                ];
            }
            
            return $value;
        } catch (PDOException $e) {
            error_log("获取设置失败: " . $e->getMessage());
            return $default;
        }
    }
    
    /**
     * 保存设置
     * 
     * @param string $category 设置类别
     * @param string $key 设置键名
     * @param mixed $value 设置值
     * @return bool 是否成功
     */
    public function saveSetting($category, $key, $value) {
        try {
            // 检查设置是否存在
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM `settings` WHERE `category` = :category AND `key` = :key");
            $stmt->bindParam(':category', $category, PDO::PARAM_STR);
            $stmt->bindParam(':key', $key, PDO::PARAM_STR);
            $stmt->execute();
            $exists = $stmt->fetchColumn() > 0;
            
            if ($exists) {
                // 更新设置
                $stmt = $this->db->prepare("UPDATE `settings` SET `value` = :value WHERE `category` = :category AND `key` = :key");
            } else {
                // 插入设置
                $stmt = $this->db->prepare("INSERT INTO `settings` (`category`, `key`, `value`) VALUES (:category, :key, :value)");
            }
            
            $stmt->bindParam(':category', $category, PDO::PARAM_STR);
            $stmt->bindParam(':key', $key, PDO::PARAM_STR);
            $stmt->bindParam(':value', $value, PDO::PARAM_STR);
            $stmt->execute();
            
            // 清除缓存
            $this->clearCache("setting_{$category}_{$key}");
            $this->clearCache("category_{$category}");
            
            return true;
        } catch (PDOException $e) {
            error_log("保存设置失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 批量保存设置
     * 
     * @param array $settings 设置数组，格式为 [category][key] = value
     * @return bool 是否成功
     */
    public function saveSettings($settings) {
        try {
            $this->db->beginTransaction();
            
            foreach ($settings as $category => $items) {
                foreach ($items as $key => $value) {
                    $this->saveSetting($category, $key, $value);
                }
            }
            
            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("批量保存设置失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 重置设置
     * 
     * @param string $category 设置类别
     * @return bool 是否成功
     */
    public function resetSettings($category) {
        try {
            $stmt = $this->db->prepare("DELETE FROM `settings` WHERE `category` = :category");
            $stmt->bindParam(':category', $category, PDO::PARAM_STR);
            $stmt->execute();
            
            // 清除缓存
            $this->clearCache("category_{$category}");
            
            return true;
        } catch (PDOException $e) {
            error_log("重置设置失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 测试邮件设置
     * 
     * @param array $settings 邮件设置
     * @return bool 是否成功
     */
    public function testEmailSettings($settings) {
        try {
            // 保存临时设置
            $originalSettings = [
                'smtp_host' => $this->getSetting('email', 'smtp_host'),
                'smtp_port' => $this->getSetting('email', 'smtp_port'),
                'smtp_username' => $this->getSetting('email', 'smtp_username'),
                'smtp_password' => $this->getSetting('email', 'smtp_password'),
                'smtp_encryption' => $this->getSetting('email', 'smtp_encryption'),
                'smtp_from_name' => $this->getSetting('email', 'smtp_from_name'),
                'smtp_from_email' => $this->getSetting('email', 'smtp_from_email')
            ];
            
            // 应用测试设置
            foreach ($settings as $key => $value) {
                $this->saveSetting('email', $key, $value);
            }
            
            // 发送测试邮件
            $result = $this->sendTestEmail();
            
            // 恢复原始设置
            foreach ($originalSettings as $key => $value) {
                $this->saveSetting('email', $key, $value);
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("测试邮件设置失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 发送测试邮件
     * 
     * @return bool 是否成功
     */
    private function sendTestEmail() {
        try {
            // 获取邮件设置
            $smtpHost = $this->getSetting('email', 'smtp_host');
            $smtpPort = $this->getSetting('email', 'smtp_port');
            $smtpUsername = $this->getSetting('email', 'smtp_username');
            $smtpPassword = $this->getSetting('email', 'smtp_password');
            $smtpEncryption = $this->getSetting('email', 'smtp_encryption');
            $fromName = $this->getSetting('email', 'smtp_from_name');
            $fromEmail = $this->getSetting('email', 'smtp_from_email');
            
            // 检查必要的设置
            if (empty($smtpHost) || empty($smtpPort) || empty($smtpUsername) || empty($smtpPassword) || empty($fromEmail)) {
                return false;
            }
            
            // 创建PHPMailer实例
            require_once __DIR__ . '/../vendor/autoload.php';
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            
            // 设置SMTP
            $mail->isSMTP();
            $mail->Host = $smtpHost;
            $mail->Port = $smtpPort;
            $mail->SMTPAuth = true;
            $mail->Username = $smtpUsername;
            $mail->Password = $smtpPassword;
            
            // 设置加密
            if ($smtpEncryption === 'ssl') {
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            } elseif ($smtpEncryption === 'tls') {
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            }
            
            // 设置发件人
            $mail->setFrom($fromEmail, $fromName);
            
            // 设置收件人
            $mail->addAddress($smtpUsername);
            
            // 设置邮件内容
            $mail->isHTML(true);
            $mail->Subject = '测试邮件 - ' . $this->getSetting('basic', 'site_name');
            $mail->Body = '<h1>测试邮件</h1><p>这是一封测试邮件，用于验证邮件设置是否正确。</p>';
            
            // 发送邮件
            $mail->send();
            
            return true;
        } catch (Exception $e) {
            error_log("发送测试邮件失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 创建备份
     * 
     * @param int $userId 用户ID
     * @param string $name 备份名称
     * @param string $description 备份描述
     * @return array|false 备份信息或失败
     */
    public function createBackup($userId, $name = '', $description = '') {
        try {
            // 生成备份文件名
            $filename = 'backup_' . date('Y-m-d_H-i-s') . '.zip';
            
            // 创建备份目录
            $backupDir = __DIR__ . '/../backups';
            if (!is_dir($backupDir)) {
                mkdir($backupDir, 0755, true);
            }
            
            // 创建备份文件
            $zip = new ZipArchive();
            $zipFile = $backupDir . '/' . $filename;
            
            if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new Exception('无法创建备份文件');
            }
            
            // 添加数据库备份
            $this->backupDatabase($zip);
            
            // 添加上传文件
            $this->backupUploads($zip);
            
            // 添加设置
            $this->backupSettings($zip);
            
            // 关闭ZIP文件
            $zip->close();
            
            // 获取文件大小
            $size = filesize($zipFile);
            
            // 保存备份记录
            $stmt = $this->db->prepare("INSERT INTO `backups` (`name`, `description`, `filename`, `size`, `created_by`) VALUES (:name, :description, :filename, :size, :created_by)");
            $stmt->bindParam(':name', $name, PDO::PARAM_STR);
            $stmt->bindParam(':description', $description, PDO::PARAM_STR);
            $stmt->bindParam(':filename', $filename, PDO::PARAM_STR);
            $stmt->bindParam(':size', $size, PDO::PARAM_INT);
            $stmt->bindParam(':created_by', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            $backupId = $this->db->lastInsertId();
            
            return [
                'id' => $backupId,
                'name' => $name,
                'description' => $description,
                'filename' => $filename,
                'size' => $size,
                'created_at' => date('Y-m-d H:i:s')
            ];
        } catch (Exception $e) {
            error_log("创建备份失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 备份数据库
     * 
     * @param ZipArchive $zip ZIP文件
     */
    private function backupDatabase($zip) {
        // 获取数据库配置
        $dbConfig = require __DIR__ . '/../config/database.php';
        
        // 创建临时SQL文件
        $sqlFile = tempnam(sys_get_temp_dir(), 'db_backup_');
        $command = sprintf(
            'mysqldump -h %s -P %s -u %s -p%s %s > %s',
            escapeshellarg($dbConfig['host']),
            escapeshellarg($dbConfig['port']),
            escapeshellarg($dbConfig['username']),
            escapeshellarg($dbConfig['password']),
            escapeshellarg($dbConfig['database']),
            escapeshellarg($sqlFile)
        );
        
        exec($command, $output, $returnVar);
        
        if ($returnVar === 0) {
            $zip->addFile($sqlFile, 'database.sql');
        }
        
        // 删除临时文件
        unlink($sqlFile);
    }
    
    /**
     * 备份上传文件
     * 
     * @param ZipArchive $zip ZIP文件
     */
    private function backupUploads($zip) {
        $uploadsDir = __DIR__ . '/../../uploads';
        
        if (is_dir($uploadsDir)) {
            $this->addDirToZip($zip, $uploadsDir, 'uploads');
        }
    }
    
    /**
     * 备份设置
     * 
     * @param ZipArchive $zip ZIP文件
     */
    private function backupSettings($zip) {
        $settings = $this->getAllSettings();
        $settingsFile = tempnam(sys_get_temp_dir(), 'settings_backup_');
        
        file_put_contents($settingsFile, json_encode($settings, JSON_PRETTY_PRINT));
        $zip->addFile($settingsFile, 'settings.json');
        
        // 删除临时文件
        unlink($settingsFile);
    }
    
    /**
     * 添加目录到ZIP文件
     * 
     * @param ZipArchive $zip ZIP文件
     * @param string $dir 目录路径
     * @param string $basePath 基础路径
     */
    private function addDirToZip($zip, $dir, $basePath) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir),
            RecursiveIteratorIterator::LEAVES_ONLY
        );
        
        foreach ($files as $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = $basePath . '/' . substr($filePath, strlen($dir) + 1);
                $zip->addFile($filePath, $relativePath);
            }
        }
    }
    
    /**
     * 获取备份列表
     * 
     * @return array 备份列表
     */
    public function getBackups() {
        try {
            $stmt = $this->db->prepare("SELECT * FROM `backups` ORDER BY `created_at` DESC");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("获取备份列表失败: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * 获取备份信息
     * 
     * @param int $backupId 备份ID
     * @return array|false 备份信息或失败
     */
    public function getBackup($backupId) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM `backups` WHERE `id` = :id");
            $stmt->bindParam(':id', $backupId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("获取备份信息失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 删除备份
     * 
     * @param int $backupId 备份ID
     * @return bool 是否成功
     */
    public function deleteBackup($backupId) {
        try {
            // 获取备份信息
            $backup = $this->getBackup($backupId);
            
            if (!$backup) {
                return false;
            }
            
            // 删除备份文件
            $backupFile = __DIR__ . '/../backups/' . $backup['filename'];
            if (file_exists($backupFile)) {
                unlink($backupFile);
            }
            
            // 删除备份记录
            $stmt = $this->db->prepare("DELETE FROM `backups` WHERE `id` = :id");
            $stmt->bindParam(':id', $backupId, PDO::PARAM_INT);
            $stmt->execute();
            
            return true;
        } catch (PDOException $e) {
            error_log("删除备份失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 恢复备份
     * 
     * @param int $backupId 备份ID
     * @return bool 是否成功
     */
    public function restoreBackup($backupId) {
        try {
            // 获取备份信息
            $backup = $this->getBackup($backupId);
            
            if (!$backup) {
                return false;
            }
            
            // 备份文件路径
            $backupFile = __DIR__ . '/../backups/' . $backup['filename'];
            
            if (!file_exists($backupFile)) {
                return false;
            }
            
            // 解压备份文件
            $zip = new ZipArchive();
            if ($zip->open($backupFile) !== true) {
                return false;
            }
            
            // 创建临时目录
            $tempDir = sys_get_temp_dir() . '/backup_restore_' . uniqid();
            mkdir($tempDir, 0755, true);
            
            // 解压文件
            $zip->extractTo($tempDir);
            $zip->close();
            
            // 恢复数据库
            if (file_exists($tempDir . '/database.sql')) {
                $this->restoreDatabase($tempDir . '/database.sql');
            }
            
            // 恢复设置
            if (file_exists($tempDir . '/settings.json')) {
                $this->restoreSettings($tempDir . '/settings.json');
            }
            
            // 恢复上传文件
            if (is_dir($tempDir . '/uploads')) {
                $this->restoreUploads($tempDir . '/uploads');
            }
            
            // 删除临时目录
            $this->removeDir($tempDir);
            
            return true;
        } catch (Exception $e) {
            error_log("恢复备份失败: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 恢复数据库
     * 
     * @param string $sqlFile SQL文件路径
     */
    private function restoreDatabase($sqlFile) {
        // 获取数据库配置
        $dbConfig = require __DIR__ . '/../config/database.php';
        
        // 执行SQL文件
        $command = sprintf(
            'mysql -h %s -P %s -u %s -p%s %s < %s',
            escapeshellarg($dbConfig['host']),
            escapeshellarg($dbConfig['port']),
            escapeshellarg($dbConfig['username']),
            escapeshellarg($dbConfig['password']),
            escapeshellarg($dbConfig['database']),
            escapeshellarg($sqlFile)
        );
        
        exec($command, $output, $returnVar);
    }
    
    /**
     * 恢复设置
     * 
     * @param string $settingsFile 设置文件路径
     */
    private function restoreSettings($settingsFile) {
        $settings = json_decode(file_get_contents($settingsFile), true);
        
        if ($settings) {
            $this->saveSettings($settings);
        }
    }
    
    /**
     * 恢复上传文件
     * 
     * @param string $uploadsDir 上传文件目录
     */
    private function restoreUploads($uploadsDir) {
        $targetDir = __DIR__ . '/../../uploads';
        
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }
        
        $this->copyDir($uploadsDir, $targetDir);
    }
    
    /**
     * 复制目录
     * 
     * @param string $src 源目录
     * @param string $dst 目标目录
     */
    private function copyDir($src, $dst) {
        $dir = opendir($src);
        
        if (!is_dir($dst)) {
            mkdir($dst, 0755, true);
        }
        
        while (($file = readdir($dir)) !== false) {
            if ($file != '.' && $file != '..') {
                $srcFile = $src . '/' . $file;
                $dstFile = $dst . '/' . $file;
                
                if (is_dir($srcFile)) {
                    $this->copyDir($srcFile, $dstFile);
                } else {
                    copy($srcFile, $dstFile);
                }
            }
        }
        
        closedir($dir);
    }
    
    /**
     * 删除目录
     * 
     * @param string $dir 目录路径
     */
    private function removeDir($dir) {
        if (is_dir($dir)) {
            $files = scandir($dir);
            
            foreach ($files as $file) {
                if ($file != '.' && $file != '..') {
                    $path = $dir . '/' . $file;
                    
                    if (is_dir($path)) {
                        $this->removeDir($path);
                    } else {
                        unlink($path);
                    }
                }
            }
            
            rmdir($dir);
        }
    }
    
    /**
     * 清除缓存
     * 
     * @param string|null $key 缓存键名，为null时清除所有缓存
     */
    public function clearCache($key = null) {
        if ($key === null) {
            $this->cache = [];
        } else {
            unset($this->cache[$key]);
        }
    }
    
    /**
     * 清除所有缓存
     */
    public function clearAllCache() {
        $this->cache = [];
    }
} 