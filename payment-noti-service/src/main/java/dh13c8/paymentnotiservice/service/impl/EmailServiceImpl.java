package dh13c8.paymentnotiservice.service.impl;

import dh13c8.paymentnotiservice.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:dh13c8.khachsan@gmail.com}")
    private String mailFrom;

    @Value("${app.mail.allow-mock-fallback:true}")
    private boolean allowMockFallback;

    @Override
    public boolean sendHtmlEmail(String to, String subject, String htmlBody) {
        log.info("? [EmailService] Chu?n b? g?i HTML Email ??n: '{}', Tiu ??: '{}'", to, subject);

        if (mailSender == null) {
            log.warn("? JavaMailSender khng kh? d?ng! Gi? l?p g?i mail thnh cng.");
            logSimulation(to, subject, htmlBody);
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("? G?i email HTML thnh cng t?i '{}'", to);
            return true;
        } catch (Exception e) {
            log.warn("? L?i khi g?i email qua SMTP: {}", e.getMessage());
            if (allowMockFallback) {
                log.info("ℹ️ Ch? ?? m ph?ng email ???c kch ho?t do SMTP g?p l?i/ch?a c m?t kh?u th?t.");
                logSimulation(to, subject, htmlBody);
                return false;
            }
            return false;
        }
    }

    @Override
    public boolean sendTextEmail(String to, String subject, String textBody) {
        log.info("? [EmailService] Chu?n b? g?i Text Email ??n: '{}', Tiu ??: '{}'", to, subject);

        if (mailSender == null) {
            log.warn("? JavaMailSender khng kh? d?ng! Gi? l?p g?i mail thnh cng.");
            logSimulation(to, subject, textBody);
            return true;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(textBody);

            mailSender.send(message);
            log.info("? G?i email v?n b?n thnh cng t?i '{}'", to);
            return true;
        } catch (Exception e) {
            log.warn("? L?i khi g?i email v?n b?n qua SMTP: {}", e.getMessage());
            if (allowMockFallback) {
                logSimulation(to, subject, textBody);
            }
            return false;
        }
    }

    private void logSimulation(String to, String subject, String body) {
        log.info("\n" +
                "======================== [MOCK EMAIL SIMULATOR] ========================\n" +
                "To: {}\n" +
                "From: {}\n" +
                "Subject: {}\n" +
                "Content:\n{}\n" +
                "========================================================================",
                to, mailFrom, subject, body);
    }
}
