package dh13c8.paymentnotiservice.repository;

import dh13c8.paymentnotiservice.entity.Notification;
import dh13c8.paymentnotiservice.entity.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserId(Long userId, Pageable pageable);

    List<Notification> findByBookingId(Long bookingId);

    List<Notification> findByStatus(NotificationStatus status);
}
