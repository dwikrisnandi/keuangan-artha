<?php
/**
 * Artha — REST API
 * Single-file API endpoint for the Personal Finance Dashboard
 *
 * Endpoints (via ?action= parameter):
 *   POST   ?action=login              — Validate/create user by access_code
 *   GET    ?action=transactions        — Fetch transactions for a user
 *   POST   ?action=add_transaction     — Add a new transaction
 *   DELETE ?action=delete_transaction  — Delete a transaction by ID
 *
 * All responses use JSON envelope: { success, data, message }
 */

// ============================================
// CORS Headers — Allow React dev server
// ============================================
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ============================================
// Bootstrap
// ============================================
require_once __DIR__ . '/config.php';

/**
 * Send a JSON response and exit
 */
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

/**
 * Get JSON body from POST request
 */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!is_array($body)) {
        jsonResponse(false, null, 'Body request harus berupa JSON yang valid.', 400);
    }

    return $body;
}

// ============================================
// Router
// ============================================
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getConnection();

    switch ($action) {

        // ----------------------------------------
        // LOGIN — Validate or create user by access_code
        // POST ?action=login
        // Body: { "access_code": "ABC123" }
        // ----------------------------------------
        case 'login':
            if ($method !== 'POST') {
                jsonResponse(false, null, 'Method harus POST.', 405);
            }

            $body = getJsonBody();
            $accessCode = trim($body['access_code'] ?? '');

            // Validate: alphanumeric, 4-20 chars
            if (empty($accessCode) || !preg_match('/^[A-Za-z0-9]{4,20}$/', $accessCode)) {
                jsonResponse(false, null, 'Kode akses harus alfanumerik, 4-20 karakter.', 422);
            }

            // Check if user exists
            $stmt = $pdo->prepare('SELECT id, access_code, created_at FROM users WHERE access_code = ?');
            $stmt->execute([$accessCode]);
            $user = $stmt->fetch();

            if ($user) {
                // Existing user — login
                jsonResponse(true, $user, 'Login berhasil.');
            }

            // New user — auto-create
            $stmt = $pdo->prepare('INSERT INTO users (access_code) VALUES (?)');
            $stmt->execute([$accessCode]);

            $newUser = [
                'id'          => (int) $pdo->lastInsertId(),
                'access_code' => $accessCode,
                'created_at'  => date('Y-m-d H:i:s'),
            ];

            jsonResponse(true, $newUser, 'Akun baru dibuat. Selamat datang!', 201);
            break;

        // ----------------------------------------
        // FETCH TRANSACTIONS — Get all transactions for a user
        // GET ?action=transactions&user_id=1
        // ----------------------------------------
        case 'transactions':
            if ($method !== 'GET') {
                jsonResponse(false, null, 'Method harus GET.', 405);
            }

            $userId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);

            if (!$userId || $userId <= 0) {
                jsonResponse(false, null, 'Parameter user_id harus berupa angka positif.', 422);
            }

            // Verify user exists
            $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            if (!$stmt->fetch()) {
                jsonResponse(false, null, 'User tidak ditemukan.', 404);
            }

            // Fetch transactions ordered by date desc
            $stmt = $pdo->prepare(
                'SELECT id, user_id, type, amount, category, description, date, created_at
                 FROM transactions
                 WHERE user_id = ?
                 ORDER BY date DESC, created_at DESC'
            );
            $stmt->execute([$userId]);
            $transactions = $stmt->fetchAll();

            // Cast numeric fields
            $transactions = array_map(function ($tx) {
                $tx['id'] = (int) $tx['id'];
                $tx['user_id'] = (int) $tx['user_id'];
                $tx['amount'] = (float) $tx['amount'];
                return $tx;
            }, $transactions);

            jsonResponse(true, $transactions, 'Data transaksi berhasil diambil.');
            break;

        // ----------------------------------------
        // ADD TRANSACTION — Insert a new transaction
        // POST ?action=add_transaction
        // Body: { user_id, type, amount, category, description?, date }
        // ----------------------------------------
        case 'add_transaction':
            if ($method !== 'POST') {
                jsonResponse(false, null, 'Method harus POST.', 405);
            }

            $body = getJsonBody();

            // Validate required fields
            $userId     = filter_var($body['user_id'] ?? 0, FILTER_VALIDATE_INT);
            $type       = trim($body['type'] ?? '');
            $amount     = filter_var($body['amount'] ?? 0, FILTER_VALIDATE_FLOAT);
            $category   = trim($body['category'] ?? '');
            $description = trim($body['description'] ?? '');
            $date       = trim($body['date'] ?? '');

            $errors = [];

            if (!$userId || $userId <= 0) {
                $errors[] = 'user_id wajib diisi dan harus angka positif.';
            }
            if (!in_array($type, ['income', 'expense', 'debt'], true)) {
                $errors[] = 'type harus salah satu: income, expense, debt.';
            }
            if ($amount === false || $amount <= 0) {
                $errors[] = 'amount harus angka positif.';
            }
            if (empty($category) || strlen($category) > 100) {
                $errors[] = 'category wajib diisi (maks 100 karakter).';
            }
            if (empty($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                $errors[] = 'date wajib dalam format YYYY-MM-DD.';
            }

            if (!empty($errors)) {
                jsonResponse(false, ['errors' => $errors], 'Validasi gagal.', 422);
            }

            // Verify user exists
            $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            if (!$stmt->fetch()) {
                jsonResponse(false, null, 'User tidak ditemukan.', 404);
            }

            // Insert transaction
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

            jsonResponse(true, $newTransaction, 'Transaksi berhasil ditambahkan.', 201);
            break;

        // ----------------------------------------
        // DELETE TRANSACTION — Remove a transaction
        // DELETE ?action=delete_transaction&id=1&user_id=1
        // ----------------------------------------
        case 'delete_transaction':
            if ($method !== 'DELETE') {
                jsonResponse(false, null, 'Method harus DELETE.', 405);
            }

            $id     = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
            $userId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);

            if (!$id || $id <= 0) {
                jsonResponse(false, null, 'Parameter id wajib diisi.', 422);
            }
            if (!$userId || $userId <= 0) {
                jsonResponse(false, null, 'Parameter user_id wajib diisi.', 422);
            }

            // Delete only if belongs to user (security: prevent cross-user deletion)
            $stmt = $pdo->prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);

            if ($stmt->rowCount() === 0) {
                jsonResponse(false, null, 'Transaksi tidak ditemukan atau bukan milik user ini.', 404);
            }

            jsonResponse(true, null, 'Transaksi berhasil dihapus.');
            break;

        // ----------------------------------------
        // Unknown action
        // ----------------------------------------
        default:
            jsonResponse(false, null, 'Action tidak dikenali. Gunakan: login, transactions, add_transaction, delete_transaction.', 400);
    }
} catch (PDOException $e) {
    // Log error server-side, don't expose details to client
    error_log('Artha API Error: ' . $e->getMessage());
    jsonResponse(false, null, 'Terjadi kesalahan pada server.', 500);
} catch (Exception $e) {
    error_log('Artha API Error: ' . $e->getMessage());
    jsonResponse(false, null, 'Terjadi kesalahan yang tidak terduga.', 500);
}
