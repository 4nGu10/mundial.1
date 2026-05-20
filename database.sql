-- ============================================
--  BASE DE DATOS: registro_personas
--  Compatible con phpMyAdmin / MySQL 5.7+
-- ============================================

CREATE DATABASE IF NOT EXISTS registro_personas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE registro_personas;

-- --------------------------------------------
--  TABLA: personas
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS personas (
  id         INT          NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(100) NOT NULL,
  edad       TINYINT      NOT NULL CHECK (edad BETWEEN 1 AND 120),
  peso       DECIMAL(5,2) NOT NULL COMMENT 'Peso en kg',
  profesion  VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
--  DATOS DE EJEMPLO
-- --------------------------------------------
INSERT INTO personas (nombre, edad, peso, profesion) VALUES
  ('Laura Martínez',  28, 62.50, 'Diseñadora Gráfica'),
  ('Carlos Gómez',    34, 78.00, 'Ingeniero de Software'),
  ('Ana Torres',      22, 55.30, 'Estudiante de Medicina'),
  ('Diego Ramírez',   45, 85.70, 'Arquitecto'),
  ('Sofía Herrera',   31, 60.10, 'Psicóloga');
