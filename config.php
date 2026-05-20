<?php
// ============================================
//  config.php  —  Conexión a la base de datos
//  Ajusta los valores según tu entorno local
// ============================================

define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // Usuario de phpMyAdmin
define('DB_PASS', '');            // Contraseña (vacía por defecto en XAMPP/WAMP)
define('DB_NAME', 'registro_personas');
define('DB_CHARSET', 'utf8mb4');

function getConnection(): mysqli {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode([
            'success' => false,
            'message' => 'Error de conexión: ' . $conn->connect_error
        ]));
    }

    $conn->set_charset(DB_CHARSET);
    return $conn;
}
