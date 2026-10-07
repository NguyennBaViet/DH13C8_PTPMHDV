USE khachsan;

-- Hash cua "password123" (BCrypt $2a$10$...)
UPDATE users SET password = '$2a$10$7pZ48Bj2yxUuqYuu6bZQz.MiOtopOYBlkkUFUlzxKnt40WqTjdp.C'
WHERE username IN ('admin', 'staff01', 'guest01', 'guest02');

-- Verify
SELECT username, LEFT(password, 7) as hash_prefix, role FROM users;
