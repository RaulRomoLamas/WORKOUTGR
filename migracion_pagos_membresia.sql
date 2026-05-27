USE carbono_powerlab_db;

CREATE TABLE IF NOT EXISTS pagos_membresia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membresia_id INT NOT NULL,
  meses INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagos_membresia
    FOREIGN KEY (membresia_id) REFERENCES membresias(id)
    ON DELETE CASCADE
);

INSERT INTO pagos_membresia (membresia_id, meses, monto, fecha_pago)
SELECT
  m.id,
  GREATEST(
    1,
    TIMESTAMPDIFF(MONTH, m.fecha_inicio, DATE_ADD(m.fecha_fin, INTERVAL 1 DAY))
  ) AS meses,
  m.monto,
  TIMESTAMP(m.fecha_inicio, '09:00:00') AS fecha_pago
FROM membresias m
WHERE NOT EXISTS (
  SELECT 1
  FROM pagos_membresia pm
  WHERE pm.membresia_id = m.id
);
