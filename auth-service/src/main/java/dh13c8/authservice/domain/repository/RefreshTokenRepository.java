package dh13c8.authservice.domain.repository;

import dh13c8.authservice.domain.entity.RefreshToken;
import dh13c8.authservice.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user AND r.revoked = false")
    void revokeAllByUser(User user);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.user = :user")
    void deleteAllByUser(User user);
}
