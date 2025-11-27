<?php
class Database {
    private $db;
    
    public function __construct() {
        try {
            $this->db = new PDO('sqlite:' . DB_PATH);
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->initDatabase();
        } catch (PDOException $e) {
            die('Database connection failed: ' . $e->getMessage());
        }
    }
    
    private function initDatabase() {
        $sql = "CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            value TEXT,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $this->db->exec($sql);
    }
    
    public function addEntry($title, $content, $value = '', $date = null) {
        if ($date === null) {
            $date = date('Y-m-d');
        }
        
        $stmt = $this->db->prepare("INSERT INTO entries (title, content, value, date) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$title, $content, $value, $date]);
    }
    
    public function getAllEntries($orderBy = 'DESC') {
        $orderBy = strtoupper($orderBy) === 'ASC' ? 'ASC' : 'DESC';
        $stmt = $this->db->query("SELECT * FROM entries ORDER BY date $orderBy, created_at $orderBy");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getEntry($id) {
        $stmt = $this->db->prepare("SELECT * FROM entries WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function deleteEntry($id) {
        $stmt = $this->db->prepare("DELETE FROM entries WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
?>
