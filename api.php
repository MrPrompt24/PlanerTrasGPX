<?php
// api.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'list':
        try {
            $stmt = $db->query("SELECT id, name, distance, profile, created_at FROM routes ORDER BY created_at DESC");
            $routes = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $routes]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'get':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'Brak identyfikatora trasy']);
            exit;
        }
        try {
            $stmt = $db->prepare("SELECT * FROM routes WHERE id = ?");
            $stmt->execute([$id]);
            $route = $stmt->fetch();
            if ($route) {
                // Decode JSON fields to avoid double encoding in response
                $route['waypoints'] = json_decode($route['waypoints']);
                $route['geometry'] = json_decode($route['geometry']);
                echo json_encode(['success' => true, 'data' => $route]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Trasa nie została znaleziona']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'save':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'error' => 'Metoda niedozwolona']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            echo json_encode(['success' => false, 'error' => 'Błędny format danych']);
            exit;
        }
        
        $id = isset($input['id']) ? (int)$input['id'] : null;
        $name = isset($input['name']) ? trim($input['name']) : '';
        $waypoints = isset($input['waypoints']) ? $input['waypoints'] : null;
        $geometry = isset($input['geometry']) ? $input['geometry'] : null;
        $distance = isset($input['distance']) ? (float)$input['distance'] : 0.0;
        $profile = isset($input['profile']) ? $input['profile'] : 'foot';
        
        if (empty($name)) {
            echo json_encode(['success' => false, 'error' => 'Nazwa trasy jest wymagana']);
            exit;
        }
        if (empty($waypoints)) {
            echo json_encode(['success' => false, 'error' => 'Punkty trasy są wymagane']);
            exit;
        }
        if (empty($geometry)) {
            echo json_encode(['success' => false, 'error' => 'Geometria trasy jest wymagana']);
            exit;
        }

        // Encode back to string for database saving
        $waypoints_str = json_encode($waypoints);
        $geometry_str = json_encode($geometry);

        try {
            if ($id) {
                // Update existing route
                $stmt = $db->prepare("UPDATE routes SET name = ?, waypoints = ?, geometry = ?, distance = ?, profile = ? WHERE id = ?");
                $stmt->execute([$name, $waypoints_str, $geometry_str, $distance, $profile, $id]);
                echo json_encode(['success' => true, 'id' => $id, 'message' => 'Trasa zaktualizowana pomyślnie']);
            } else {
                // Insert new route
                $stmt = $db->prepare("INSERT INTO routes (name, waypoints, geometry, distance, profile) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$name, $waypoints_str, $geometry_str, $distance, $profile]);
                $newId = $db->lastInsertId();
                echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Trasa zapisana pomyślnie']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'delete':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'error' => 'Metoda niedozwolona']);
            exit;
        }
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'Brak identyfikatora trasy']);
            exit;
        }
        try {
            $stmt = $db->prepare("DELETE FROM routes WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Trasa usunięta pomyślnie']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Nieznana akcja']);
        break;
}
