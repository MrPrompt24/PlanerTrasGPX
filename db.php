<?php
// db.php
// Setup error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

$dataDir = __DIR__ . '/data';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0777, true);
}

$dbPath = $dataDir . '/database.sqlite';

try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Create routes table if it doesn't exist
    $db->exec("CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        waypoints TEXT NOT NULL,
        geometry TEXT NOT NULL,
        distance REAL NOT NULL,
        profile TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
} catch (PDOException $e) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => "Błąd połączenia z bazą danych: " . $e->getMessage()
    ]);
    exit;
}
