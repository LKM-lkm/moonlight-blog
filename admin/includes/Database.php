<?php
/**
 * 数据库操作类
 */
class Database {
    private static $instance = null;
    private $pdo = null;
    private $config = [];
    private $logger = null;
    private $inTransaction = false;

    private function __construct() {
        $this->config = require ROOT_PATH . '/config/database.php';
        $this->logger = Logger::getInstance();
        $this->connect();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function connect() {
        try {
            $config = $this->config['default'];
            $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$config['charset']}"
            ];

            $this->pdo = new PDO($dsn, $config['username'], $config['password'], $options);
            
            if ($this->config['debug']['log_queries']) {
                $this->logger->info('Database connection established successfully');
            }
        } catch (PDOException $e) {
            $this->logger->error('Database connection failed: ' . $e->getMessage());
            throw new Exception('数据库连接失败');
        }
    }

    public function query($sql, $params = []) {
        try {
            $startTime = microtime(true);
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $endTime = microtime(true);

            $executionTime = $endTime - $startTime;
            if ($executionTime > $this->config['query']['slow_query_threshold']) {
                $this->logger->warning("Slow query detected: {$sql}", [
                    'execution_time' => $executionTime,
                    'params' => $params
                ]);
            }

            if ($this->config['debug']['log_queries']) {
                $this->logger->debug("SQL Query: {$sql}", [
                    'params' => $params,
                    'execution_time' => $executionTime
                ]);
            }

            return $stmt;
        } catch (PDOException $e) {
            $this->logger->error('Query execution failed: ' . $e->getMessage(), [
                'sql' => $sql,
                'params' => $params
            ]);
            throw new Exception('查询执行失败');
        }
    }

    public function fetch($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }

    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }

    public function insert($table, $data) {
        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');
        
        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $table,
            implode(', ', $fields),
            implode(', ', $placeholders)
        );

        $this->query($sql, array_values($data));
        return $this->pdo->lastInsertId();
    }

    public function update($table, $data, $where, $whereParams = []) {
        $set = array_map(function($field) {
            return "{$field} = ?";
        }, array_keys($data));

        $sql = sprintf(
            "UPDATE %s SET %s WHERE %s",
            $table,
            implode(', ', $set),
            $where
        );

        $params = array_merge(array_values($data), $whereParams);
        return $this->query($sql, $params)->rowCount();
    }

    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        return $this->query($sql, $params)->rowCount();
    }

    public function beginTransaction() {
        if (!$this->inTransaction) {
            $this->pdo->beginTransaction();
            $this->inTransaction = true;
            if ($this->config['debug']['log_queries']) {
                $this->logger->debug('Transaction started');
            }
        }
    }

    public function commit() {
        if ($this->inTransaction) {
            $this->pdo->commit();
            $this->inTransaction = false;
            if ($this->config['debug']['log_queries']) {
                $this->logger->debug('Transaction committed');
            }
        }
    }

    public function rollback() {
        if ($this->inTransaction) {
            $this->pdo->rollBack();
            $this->inTransaction = false;
            if ($this->config['debug']['log_queries']) {
                $this->logger->debug('Transaction rolled back');
            }
        }
    }

    public function quote($value) {
        return $this->pdo->quote($value);
    }

    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }
} 