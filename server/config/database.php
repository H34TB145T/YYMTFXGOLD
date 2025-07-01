<?php
// Database configuration - Updated with your actual credentials
// Fixed MySQLi bind_param error and improved error handling

$host = 'localhost';
$dbname = 'zpjhpszw_fxgold';
$username = 'zpjhpszw_fxgold_admin';
$password = 'Fxgold_admin123!@#';

// Try PDO first, fallback to MySQLi
try {
    // Check if PDO MySQL is available
    if (extension_loaded('pdo_mysql')) {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        // Test connection
        $stmt = $pdo->query("SELECT 1");
        
        // Update admin password if needed
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ? AND role = 'admin'");
        $newPasswordHash = password_hash('FxgoldAdmin123!@#', PASSWORD_DEFAULT);
        $stmt->execute([$newPasswordHash, 'admin@fxgold.shop']);
        
        error_log("PDO MySQL connection successful");
    } else {
        throw new Exception("PDO MySQL not available, trying MySQLi");
    }
} catch(Exception $e) {
    error_log("Database connection error: " . $e->getMessage());
    
    // Fallback to MySQLi if PDO fails
    if (extension_loaded('mysqli')) {
        try {
            $mysqli = new mysqli($host, $username, $password, $dbname);
            
            if ($mysqli->connect_error) {
                throw new Exception("MySQLi Connection failed: " . $mysqli->connect_error);
            }
            
            $mysqli->set_charset("utf8mb4");
            
            // Test connection
            $result = $mysqli->query("SELECT 1");
            if (!$result) {
                throw new Exception("MySQLi test query failed: " . $mysqli->error);
            }
            
            // Create a PDO-like wrapper for MySQLi (FIXED VERSION)
            class MySQLiWrapper {
                private $mysqli;
                
                public function __construct($mysqli) {
                    $this->mysqli = $mysqli;
                }
                
                public function prepare($sql) {
                    $stmt = $this->mysqli->prepare($sql);
                    if (!$stmt) {
                        throw new Exception("Prepare failed: " . $this->mysqli->error);
                    }
                    return new MySQLiStatementWrapper($stmt);
                }
                
                public function query($sql) {
                    $result = $this->mysqli->query($sql);
                    if ($result === false) {
                        throw new Exception($this->mysqli->error);
                    }
                    return new MySQLiResultWrapper($result);
                }
                
                public function exec($sql) {
                    $result = $this->mysqli->query($sql);
                    if ($result === false) {
                        throw new Exception($this->mysqli->error);
                    }
                    return $this->mysqli->affected_rows;
                }
            }
            
            class MySQLiStatementWrapper {
                private $stmt;
                
                public function __construct($stmt) {
                    $this->stmt = $stmt;
                }
                
                public function execute($params = []) {
                    if (!empty($params)) {
                        // FIXED: Properly handle bind_param with references
                        $types = str_repeat('s', count($params));
                        
                        // Create array of references for bind_param
                        $bindParams = array($types);
                        for ($i = 0; $i < count($params); $i++) {
                            $bindParams[] = &$params[$i];
                        }
                        
                        // Call bind_param with proper references
                        call_user_func_array(array($this->stmt, 'bind_param'), $bindParams);
                    }
                    
                    $result = $this->stmt->execute();
                    if (!$result) {
                        throw new Exception("Execute failed: " . $this->stmt->error);
                    }
                    return $result;
                }
                
                public function fetch() {
                    $result = $this->stmt->get_result();
                    if (!$result) {
                        return false;
                    }
                    return $result->fetch_assoc();
                }
                
                public function fetchAll() {
                    $result = $this->stmt->get_result();
                    if (!$result) {
                        return [];
                    }
                    return $result->fetch_all(MYSQLI_ASSOC);
                }
                
                public function fetchColumn() {
                    $result = $this->stmt->get_result();
                    if (!$result) {
                        return false;
                    }
                    $row = $result->fetch_array(MYSQLI_NUM);
                    return $row ? $row[0] : false;
                }
                
                public function rowCount() {
                    return $this->stmt->affected_rows;
                }
            }
            
            class MySQLiResultWrapper {
                private $result;
                
                public function __construct($result) {
                    $this->result = $result;
                }
                
                public function fetch() {
                    return $this->result->fetch_assoc();
                }
                
                public function fetchAll() {
                    return $this->result->fetch_all(MYSQLI_ASSOC);
                }
                
                public function fetchColumn() {
                    $row = $this->result->fetch_array(MYSQLI_NUM);
                    return $row ? $row[0] : false;
                }
            }
            
            $pdo = new MySQLiWrapper($mysqli);
            error_log("MySQLi connection successful (fallback)");
            
            // Update admin password using MySQLi (FIXED VERSION)
            $stmt = $mysqli->prepare("UPDATE users SET password = ? WHERE email = ? AND role = ?");
            if ($stmt) {
                $newPasswordHash = password_hash('FxgoldAdmin123!@#', PASSWORD_DEFAULT);
                $email = 'admin@fxgold.shop';
                $role = 'admin';
                $stmt->bind_param('sss', $newPasswordHash, $email, $role);
                $stmt->execute();
                $stmt->close();
            }
            
        } catch (Exception $e) {
            error_log("MySQLi connection also failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    } else {
        throw new Exception("Neither PDO nor MySQLi extensions are available on this server");
    }
}
?>