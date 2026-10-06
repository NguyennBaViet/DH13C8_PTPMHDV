package dh13c8.paymentnotiservice.service;

public interface EmailService {

    boolean sendHtmlEmail(String to, String subject, String htmlBody);

    boolean sendTextEmail(String to, String subject, String textBody);
}
