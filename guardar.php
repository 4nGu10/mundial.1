<?php
// ============================================
//  guardar.php  —  Registra una nueva persona
// ============================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

// --- Sanitizar y validar ---
$nombre   = trim($_POST['nombre']   ?? '');
$edad     = intval($_POST['edad']   ?? 0);
$peso     = floatval($_POST['peso'] ?? 0);
$profesion = trim($_POST['profesion'] ?? '');

$errores = [];

if ($nombre === '' || strlen($nombre) > 100) {
    $errores[] = 'El nombre es obligatorio (máx. 100 caracteres).';
}
if ($edad < 1 || $edad > 120) {
    $errores[] = 'La edad debe estar entre 1 y 120 años.';
}
if ($peso <= 0 || $peso > 500) {
    $errores[] = 'El peso debe ser un valor positivo (máx. 500 kg).';
}
if ($profesion === '' || strlen($profesion) > 100) {
    $errores[] = 'La profesión es obligatoria (máx. 100 caracteres).';
}

if (!empty($errores)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(' ', $errores)]);
    exit;
}

// --- Insertar ---
$conn = getConnection();
$stmt = $conn->prepare(
    'INSERT INTO personas (nombre, edad, peso, profesion) VALUES (?, ?, ?, ?)'
);
$stmt->bind_param('sids', $nombre, $edad, $peso, $profesion);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => '¡Persona registrada correctamente!',
        'id'      => $conn->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
