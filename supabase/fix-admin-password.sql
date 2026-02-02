-- Script para actualizar la contraseña del admin
-- Ejecutar este script en Supabase SQL Editor si el login no funciona

-- Script para actualizar la contraseña del admin
-- Ejecutar este script en Supabase SQL Editor si el login no funciona

-- Actualizar hash de contraseña para admin@keroro.store
-- Contraseña: keroro123
UPDATE keroro_users 
SET password_hash = '$2a$10$gg3GeHw50pvh7/W1VBoC.uJ2n0nBw7uhTHnTsjTGxWPEA1/wwyWkm'
WHERE email = 'admin@keroro.store';

-- Si el usuario no existe, crearlo
INSERT INTO keroro_users (email, password_hash, role) 
VALUES ('admin@keroro.store', '$2a$10$gg3GeHw50pvh7/W1VBoC.uJ2n0nBw7uhTHnTsjTGxWPEA1/wwyWkm', 'admin')
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash;

-- Verificar que se actualizó correctamente
SELECT email, role, 
       CASE 
         WHEN password_hash = '$2a$10$gg3GeHw50pvh7/W1VBoC.uJ2n0nBw7uhTHnTsjTGxWPEA1/wwyWkm' 
         THEN 'Hash correcto' 
         ELSE 'Hash incorrecto' 
       END as hash_status
FROM keroro_users 
WHERE email = 'admin@keroro.store';
