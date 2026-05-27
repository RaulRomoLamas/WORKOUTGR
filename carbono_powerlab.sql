DROP DATABASE IF EXISTS carbono_powerlab_db;
CREATE DATABASE carbono_powerlab_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE carbono_powerlab_db;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('administrador', 'entrenador', 'cliente') NOT NULL,
  telefono VARCHAR(20),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE membresias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('mensual', 'trimestral', 'anual') NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado ENUM('activa', 'vencida', 'cancelada') DEFAULT 'activa',
  monto DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_membresias_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE pagos_membresia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membresia_id INT NOT NULL,
  meses INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagos_membresia
    FOREIGN KEY (membresia_id) REFERENCES membresias(id)
    ON DELETE CASCADE
);

CREATE TABLE rutinas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  entrenador_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  objetivo VARCHAR(150),
  nivel ENUM('principiante', 'intermedio', 'avanzado') DEFAULT 'principiante',
  fecha_asignacion DATE NOT NULL,
  CONSTRAINT fk_rutinas_cliente
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  CONSTRAINT fk_rutinas_entrenador
    FOREIGN KEY (entrenador_id) REFERENCES usuarios(id)
);

CREATE TABLE rutina_ejercicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rutina_id INT NOT NULL,
  ejercicio VARCHAR(150) NOT NULL,
  series INT,
  repeticiones VARCHAR(50),
  descanso VARCHAR(50),
  CONSTRAINT fk_rutina_ejercicios_rutina
    FOREIGN KEY (rutina_id) REFERENCES rutinas(id)
    ON DELETE CASCADE
);

CREATE TABLE progreso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  peso DECIMAL(5,2),
  porcentaje_grasa DECIMAL(5,2),
  cintura DECIMAL(5,2),
  pecho DECIMAL(5,2),
  brazo DECIMAL(5,2),
  pierna DECIMAL(5,2),
  fecha_registro DATE NOT NULL,
  observaciones TEXT,
  CONSTRAINT fk_progreso_cliente
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
);

CREATE TABLE mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  asunto VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password para todos los usuarios de prueba: 123456
SET @hash_123456 = '$2a$10$3qq6D9TDaIY3KyvGu0U.E.i4m94avB.1mMaAJnYM1Z/nuNY4GW2uG';

INSERT INTO usuarios (id, nombre, correo, password, rol, telefono) VALUES
(1, 'Admin Carbono', 'admin@carbonopowerlab.com', @hash_123456, 'administrador', '555-100-1000'),
(2, 'Valeria Torres', 'entrenador@carbonopowerlab.com', @hash_123456, 'entrenador', '555-200-2000'),
(3, 'Marco Ruiz', 'marco.entrenador@carbonopowerlab.com', @hash_123456, 'entrenador', '555-200-2001'),
(4, 'Luis Ramirez', 'cliente@carbonopowerlab.com', @hash_123456, 'cliente', '555-300-3000'),
(5, 'Ana Lopez', 'ana.lopez@correo.com', @hash_123456, 'cliente', '555-300-3001'),
(6, 'Carlos Vega', 'carlos.vega@correo.com', @hash_123456, 'cliente', '555-300-3002'),
(7, 'Diana Mora', 'diana.mora@correo.com', @hash_123456, 'cliente', '555-300-3003'),
(8, 'Sofia Castillo', 'sofia.castillo@correo.com', @hash_123456, 'cliente', '555-300-3004');

INSERT INTO membresias (usuario_id, tipo, fecha_inicio, fecha_fin, estado, monto) VALUES
(4, 'mensual', '2026-04-01', '2026-04-30', 'activa', 650.00),
(5, 'trimestral', '2026-03-01', '2026-05-31', 'activa', 1700.00),
(6, 'mensual', '2026-02-01', '2026-02-28', 'vencida', 650.00),
(7, 'anual', '2025-01-15', '2026-01-14', 'vencida', 5900.00),
(8, 'mensual', '2026-04-10', '2026-05-09', 'activa', 650.00);

INSERT INTO pagos_membresia (membresia_id, meses, monto, fecha_pago) VALUES
(1, 1, 650.00, '2026-04-01 09:00:00'),
(2, 3, 1700.00, '2026-03-01 09:00:00'),
(3, 1, 650.00, '2026-02-01 09:00:00'),
(4, 12, 5900.00, '2025-01-15 09:00:00'),
(5, 1, 650.00, '2026-04-10 09:00:00');

INSERT INTO rutinas (id, cliente_id, entrenador_id, nombre, descripcion, objetivo, nivel, fecha_asignacion) VALUES
(1, 4, 2, 'Fuerza inicial', 'Rutina base de fuerza con movimientos compuestos.', 'Ganar fuerza y tecnica', 'principiante', '2026-04-05'),
(2, 5, 2, 'Hipertrofia tren superior', 'Trabajo enfocado en pecho, espalda y brazos.', 'Aumentar masa muscular', 'intermedio', '2026-04-08'),
(3, 6, 3, 'Acondicionamiento total', 'Circuitos de resistencia y control metabolico.', 'Mejorar condicion fisica', 'intermedio', '2026-03-20'),
(4, 8, 3, 'Definicion avanzada', 'Trabajo combinado de fuerza, accesorios y cardio.', 'Reducir grasa corporal', 'avanzado', '2026-04-12');

INSERT INTO rutina_ejercicios (rutina_id, ejercicio, series, repeticiones, descanso) VALUES
(1, 'Sentadilla goblet', 4, '10', '75 seg'),
(1, 'Press banca', 4, '8', '90 seg'),
(1, 'Remo con mancuerna', 3, '12', '60 seg'),
(2, 'Press inclinado', 4, '10', '90 seg'),
(2, 'Jalon al pecho', 4, '12', '75 seg'),
(2, 'Curl biceps', 3, '12', '45 seg'),
(3, 'Burpees', 5, '12', '45 seg'),
(3, 'Kettlebell swing', 4, '15', '45 seg'),
(3, 'Plancha', 3, '45 seg', '45 seg'),
(4, 'Peso muerto rumano', 4, '8', '90 seg'),
(4, 'Zancadas caminando', 4, '12 por pierna', '60 seg'),
(4, 'Cardio HIIT', 6, '30/30', '30 seg');

INSERT INTO progreso (cliente_id, peso, porcentaje_grasa, cintura, pecho, brazo, pierna, fecha_registro, observaciones) VALUES
(4, 82.50, 24.10, 92.00, 101.00, 34.00, 58.00, '2026-03-01', 'Evaluacion inicial'),
(4, 80.90, 22.80, 89.50, 101.50, 34.50, 58.50, '2026-04-01', 'Mejor adherencia al plan'),
(5, 64.20, 27.00, 78.00, 88.00, 28.00, 52.00, '2026-03-05', 'Inicio de hipertrofia'),
(5, 65.10, 26.20, 77.00, 89.00, 29.00, 53.00, '2026-04-05', 'Aumento de carga progresiva'),
(6, 91.00, 29.50, 103.00, 110.00, 37.00, 64.00, '2026-02-20', 'Requiere renovar membresia'),
(7, 70.40, 25.00, 82.00, 93.00, 31.00, 55.00, '2026-01-10', 'Seguimiento pausado'),
(8, 58.70, 21.30, 70.00, 84.00, 27.00, 50.00, '2026-04-14', 'Buen rendimiento');

INSERT INTO mensajes (nombre, correo, asunto, mensaje) VALUES
('Pedro Hernandez', 'pedro@example.com', 'Informacion de horarios', 'Quiero conocer los horarios disponibles para entrenamiento funcional.'),
('Mariana Flores', 'mariana@example.com', 'Consulta de membresia', 'Me interesa saber si manejan planes trimestrales para estudiantes.');
