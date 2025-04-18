<?php
/**
 * 数据库连接类
 * 
 * 管理数据库连接，提供单例模式确保只有一个数据库连接实例
 */

class Database {
    private static $instance = null;
    private $connection = null;
    private $config = null;
    
    /**
     * 私有构造函数，防止外部实例化
     */
    private function __construct() {
        $this->loadConfig();
        $this->connect();
    }
    
    /**
     * 获取数据库实例
     * 
     * @return Database 数据库实例
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 加载数据库配置
     */
    private function loadConfig() {
        $configFile = __DIR__ . '/../config/database.php';
        
        if (file_exists($configFile)) {
            $this->config = require $configFile;
        } else {
            throw new Exception('数据库配置文件不存在');
        }
    }
    
    /**
     * 连接数据库
     */
    private function connect() {
        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $this->config['host'],
                $this->config['port'],
                $this->config['database'],
                $this->config['charset']
            );
            
            $this->connection = new PDO(
                $dsn,
                $this->config['username'],
                $this->config['password'],
                $this->config['options']
            );
        } catch (PDOException $e) {
            error_log('数据库连接失败: ' . $e->getMessage());
            throw new Exception('数据库连接失败');
        }
    }
    
    /**
     * 获取数据库连接
     * 
     * @return PDO 数据库连接
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * 执行SQL查询
     * 
     * @param string $sql SQL语句
     * @param array $params 参数
     * @return PDOStatement 查询结果
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log('SQL查询失败: ' . $e->getMessage());
            throw new Exception('SQL查询失败');
        }
    }
    
    /**
     * 获取单行数据
     * 
     * @param string $sql SQL语句
     * @param array $params 参数
     * @return array|false 单行数据或false
     */
    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }
    
    /**
     * 获取多行数据
     * 
     * @param string $sql SQL语句
     * @param array $params 参数
     * @return array 多行数据
     */
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
    
    /**
     * 获取单个值
     * 
     * @param string $sql SQL语句
     * @param array $params 参数
     * @return mixed 单个值
     */
    public function fetchColumn($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchColumn();
    }
    
    /**
     * 插入数据
     * 
     * @param string $table 表名
     * @param array $data 数据
     * @return int 最后插入的ID
     */
    public function insert($table, $data) {
        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');
        
        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            $this->quoteIdentifier($table),
            implode(', ', array_map([$this, 'quoteIdentifier'], $fields)),
            implode(', ', $placeholders)
        );
        
        $this->query($sql, array_values($data));
        
        return $this->connection->lastInsertId();
    }
    
    /**
     * 更新数据
     * 
     * @param string $table 表名
     * @param array $data 数据
     * @param string $where 条件
     * @param array $params 参数
     * @return int 受影响的行数
     */
    public function update($table, $data, $where, $params = []) {
        $set = [];
        
        foreach ($data as $field => $value) {
            $set[] = sprintf('%s = ?', $this->quoteIdentifier($field));
        }
        
        $sql = sprintf(
            'UPDATE %s SET %s WHERE %s',
            $this->quoteIdentifier($table),
            implode(', ', $set),
            $where
        );
        
        $stmt = $this->query($sql, array_merge(array_values($data), $params));
        
        return $stmt->rowCount();
    }
    
    /**
     * 删除数据
     * 
     * @param string $table 表名
     * @param string $where 条件
     * @param array $params 参数
     * @return int 受影响的行数
     */
    public function delete($table, $where, $params = []) {
        $sql = sprintf(
            'DELETE FROM %s WHERE %s',
            $this->quoteIdentifier($table),
            $where
        );
        
        $stmt = $this->query($sql, $params);
        
        return $stmt->rowCount();
    }
    
    /**
     * 开始事务
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    /**
     * 提交事务
     */
    public function commit() {
        return $this->connection->commit();
    }
    
    /**
     * 回滚事务
     */
    public function rollBack() {
        return $this->connection->rollBack();
    }
    
    /**
     * 转义标识符
     * 
     * @param string $identifier 标识符
     * @return string 转义后的标识符
     */
    private function quoteIdentifier($identifier) {
        return '`' . str_replace('`', '``', $identifier) . '`';
    }
    
    /**
     * 防止克隆
     */
    private function __clone() {}
    
    /**
     * 防止反序列化
     */
    private function __wakeup() {}
} 