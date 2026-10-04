package dh13c8.paymentnotiservice.repository;

import dh13c8.paymentnotiservice.entity.Payment;
import dh13c8.paymentnotiservice.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    Optional<Payment> findByTransactionId(String transactionId);

    Page<Payment> findByUserId(Long userId, Pageable pageable);

    List<Payment> findByBookingIdAndStatus(Long bookingId, PaymentStatus status);

    boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);
}
