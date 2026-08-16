<?php
/**
 * Artha — REST API
 * Single-file API endpoint for the Personal Finance Dashboard
 */

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_domains = ['http://localhost:5173', 'https://apps.arthavirddhisampada.online'];
if (in_array($origin, $allowed_domains)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://apps.arthavirddhisampada.online');
}
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';

function jsonResponse(bool $success, $data = null, string $message = '', int $code = 200): void
{
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data'    => $data,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!is_array($body)) {
        jsonResponse(false, null, 'Request body must be valid JSON.', 400);
    }
    return $body;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getConnection();

    switch ($action) {

        case 'login':
            if ($method !== 'POST') {
                jsonResponse(false, null, 'Method must be POST.', 405);
            }
            $body = getJsonBody();
            $accessCode = trim($body['access_code'] ?? '');

            if (empty($accessCode)) {
                jsonResponse(false, null, 'Access code cannot be empty.', 422);
            }

            $stmt = $pdo->prepare('SELECT id, access_code, role, currency_code, created_at FROM users WHERE access_code = ?');
            $stmt->execute([$accessCode]);
            $user = $stmt->fetch();

            if ($user) {
                jsonResponse(true, $user, 'Login successful.');
            } else {
                jsonResponse(false, null, 'Invalid access code. Please contact Admin.', 401);
            }
            break;

        case 'set_currency':
            if ($method !== 'POST') {
                jsonResponse(false, null, 'Method must be POST.', 405);
            }
            $body = getJsonBody();
            $userId = filter_var($body['user_id'] ?? 0, FILTER_VALIDATE_INT);
            $currencyCode = trim($body['currency_code'] ?? '');

            if (!$userId || empty($currencyCode)) {
                jsonResponse(false, null, 'Incomplete data.', 422);
            }

            $stmt = $pdo->prepare('UPDATE users SET currency_code = ? WHERE id = ?');
            $stmt->execute([$currencyCode, $userId]);

            jsonResponse(true, null, 'Currency successfully updated.');
            break;

        case 'generate_code':
            if ($method !== 'POST') {
                jsonResponse(false, null, 'Method must be POST.', 405);
            }
            $body = getJsonBody();
            $adminId = filter_var($body['admin_id'] ?? 0, FILTER_VALIDATE_INT);
            if (!$adminId) {
                jsonResponse(false, null, 'Access denied.', 401);
            }

            $stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
            $stmt->execute([$adminId]);
            $admin = $stmt->fetch();
            if (!$admin || $admin['role'] !== 'admin') {
                jsonResponse(false, null, 'Access denied. You are not an admin.', 403);
            }

            $newCode = strtoupper(substr(md5(uniqid(rand(), true)), 0, 7));

            $stmt = $pdo->prepare('INSERT INTO users (access_code, role) VALUES (?, ?)');
            $stmt->execute([$newCode, 'user']);

            $newUser = [
                'id' => (int) $pdo->lastInsertId(),
                'access_code' => $newCode,
                'role' => 'user',
                'created_at' => date('Y-m-d H:i:s'),
            ];
            jsonResponse(true, $newUser, 'New access code successfully generated.', 201);
            break;

        case 'get_users':
            if ($method !== 'GET') {
                jsonResponse(false, null, 'Method must be GET.', 405);
            }
            $adminId = filter_input(INPUT_GET, 'admin_id', FILTER_VALIDATE_INT);
            if (!$adminId) {
                jsonResponse(false, null, 'Access denied.', 401);
            }

            $stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
            $stmt->execute([$adminId]);
            $admin = $stmt->fetch();
            if (!$admin || $admin['role'] !== 'admin') {
                jsonResponse(false, null, 'Access denied. You are not an admin.', 403);
            }

            $stmt = $pdo->prepare('
                SELECT u.id, u.access_code, u.created_at, COUNT(t.id) as tx_count 
                FROM users u 
                LEFT JOIN transactions t ON u.id = t.user_id 
                WHERE u.role = "user" 
                GROUP BY u.id 
                ORDER BY u.created_at DESC
            ');
            $stmt->execute();
            $users = $stmt->fetchAll();

            jsonResponse(true, $users, 'User list successfully retrieved.');
            break;

        case 'transactions':
            if ($method !== 'GET') {
                jsonResponse(false, null, 'Method must be GET.', 405);
            }
            $userId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
            if (!$userId) {
                jsonResponse(false, null, 'User ID must be a positive integer.', 422);
            }

            $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            if (!$stmt->fetch()) {
                jsonResponse(false, null, 'User not found.', 404);
            }

            $stmt = $pdo->prepare(
                'SELECT id, user_id, type, amount, category, description, date, created_at
                 FROM transactions
                 WHERE user_id = ?
                 ORDER BY date DESC, created_at DESC'
            );
            $stmt->execute([$userId]);
            $transactions = $stmt->fetchAll();

            $transactions = array_map(function ($tx) {
                $tx['id'] = (int) $tx['id'];
                $tx['user_id'] = (int) $tx['user_id'];
                $tx['amount'] = (float) $tx['amount'];
                return $tx;
            }, $transactions);

            jsonResponse(true, $transactions, 'Transactions successfully retrieved.');
            break;

        case 'add_transaction':
            if ($method !== 'POST') {
                jsonResponse(false, null, 'Method must be POST.', 405);
            }
            $body = getJsonBody();
            $userId     = filter_var($body['user_id'] ?? 0, FILTER_VALIDATE_INT);
            $type       = trim($body['type'] ?? '');
            $amount     = filter_var($body['amount'] ?? 0, FILTER_VALIDATE_FLOAT);
            $category   = trim($body['category'] ?? '');
            $description = trim($body['description'] ?? '');
            $date       = trim($body['date'] ?? '');

            $errors = [];
            if (!$userId || $userId <= 0) $errors[] = 'user_id is required.';
            if (!in_array($type, ['income', 'expense', 'debt'], true)) $errors[] = 'Invalid type.';
            if ($amount === false || $amount <= 0) $errors[] = 'Amount must be > 0.';
            if (empty($category) || strlen($category) > 100) $errors[] = 'Invalid category.';
            if (!empty($description) && strlen($description) > 255) $errors[] = 'Description too long.';
            if (empty($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) $errors[] = 'Invalid date format (YYYY-MM-DD).';

            if (!empty($errors)) {
                jsonResponse(false, ['errors' => $errors], 'Validation failed.', 422);
            }

            $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            if (!$stmt->fetch()) {
                jsonResponse(false, null, 'User not found.', 404);
            }

            $stmt = $pdo->prepare(
                'INSERT INTO transactions (user_id, type, amount, category, description, date)
                 VALUES (?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([$userId, $type, $amount, $category, $description ?: null, $date]);

            $newTransaction = [
                'id'          => (int) $pdo->lastInsertId(),
                'user_id'     => $userId,
                'type'        => $type,
                'amount'      => (float) $amount,
                'category'    => $category,
                'description' => $description ?: null,
                'date'        => $date,
                'created_at'  => date('Y-m-d H:i:s'),
            ];
            jsonResponse(true, $newTransaction, 'Transaction successfully added.', 201);
            break;

        case 'delete_transaction':
            if ($method !== 'DELETE') {
                jsonResponse(false, null, 'Method must be POST.', 405);
            }
            $id     = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
            $userId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);

            if (!$id || !$userId) {
                jsonResponse(false, null, 'Parameter wajib diisi.', 422);
            }

            $stmt = $pdo->prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);

            if ($stmt->rowCount() === 0) {
                jsonResponse(false, null, 'Invalid transaction ID.', 422);
            }
            jsonResponse(true, null, 'Transaction successfully deleted.');
            break;

        default:
            jsonResponse(false, null, 'Invalid action.', 400);
    }
} catch (PDOException $e) {
    error_log('API Error: ' . $e->getMessage());
    jsonResponse(false, null, 'Terjadi kesalahan server.', 500);
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    jsonResponse(false, null, 'Terjadi kesalahan tidak terduga.', 500);
}
