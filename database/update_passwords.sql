USE khachsan;

-- Hash của "123456" (BCrypt $2a$10$...)
-- Được tạo bằng: new BCryptPasswordEncoder(10).encode("123456")
UPDATE users SET password = '$2a$10$eDyhFxCPLABo3MUiRvKhC.BmUFbFkYHEv.TJbQYm5QHqNOakXs8By'
WHERE username IN ('admin', 'staff01', 'guest01', 'guest02');

-- Verify
SELECT username, LEFT(password, 7) as hash_prefix, role FROM users;
