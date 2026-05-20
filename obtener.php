<?php
// ============================================
//  obtener.php  —  Devuelve lista de personas
//  GET ?buscar=texto  →  filtra por nombre o profesión
//  GET ?id=N          →  devuelve una persona por id
// ============================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

$conn = getConnection();

// --- Detalle de una persona ---
if (isset($_GET['id'])) {
    $id   = intval($_GET['id']);
    $stmt = $conn->prepare(
        'SELECT id, nombre, edad, peso, profesion,
                DATE_FORMAT(created_at, "%d/%m/%Y %H:%i") AS registrado
         FROM personas WHERE id = ?'
    );
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode(['success' => true, 'persona' => $row]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Persona no encontrada.']);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// --- Lista con búsqueda opcional ---
$buscar = trim($_GET['buscar'] ?? '');

if ($buscar !== '') {
    $like = '%' . $buscar . '%';
    $stmt = $conn->prepare(
        'SELECT id, nombre, edad, peso, profesion,
                DATE_FORMAT(created_at, "%d/%m/%Y %H:%i") AS registrado
         FROM personas
         WHERE nombre LIKE ? OR profesion LIKE ?
         ORDER BY nombre ASC'
    );
    $stmt->bind_param('ss', $like, $like);
} else {
    $stmt = $conn->prepare(
        'SELECT id, nombre, edad, peso, profesion,
                DATE_FORMAT(created_at, "%d/%m/%Y %H:%i") AS registrado
         FROM personas
         ORDER BY nombre ASC'
    );
}

$stmt->execute();
$result  = $stmt->get_result();
$personas = [];

while ($row = $result->fetch_assoc()) {
    $personas[] = $row;
}

echo json_encode(['success' => true, 'personas' => $personas, 'total' => count($personas)]);

$stmt->close();
$conn->close();
