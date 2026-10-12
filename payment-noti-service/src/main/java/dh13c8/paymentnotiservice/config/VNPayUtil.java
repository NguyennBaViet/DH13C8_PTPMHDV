package dh13c8.paymentnotiservice.config;

import jakarta.servlet.http.HttpServletRequest;

public class VNPayUtil {

    public static String getIpAddress(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        if (ip == null || ip.isEmpty() || "0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }

    public static String getResponseMessage(String responseCode) {
        if (responseCode == null) return "Giao dịch không xác định";
        return switch (responseCode) {
            case "00" -> "Giao dịch thành công";
            case "07" -> "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, bất thường)";
            case "09" -> "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng";
            case "10" -> "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            case "11" -> "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch";
            case "12" -> "Thẻ/Tài khoản của khách hàng bị khóa";
            case "13" -> "Nhập sai mật khẩu xác thực giao dịch (OTP)";
            case "24" -> "Giao dịch bị hủy bởi khách hàng";
            case "51" -> "Tài khoản không đủ số dư để thực hiện giao dịch";
            case "65" -> "Tài khoản đã vượt quá hạn mức giao dịch trong ngày";
            case "75" -> "Ngân hàng thanh toán đang bảo trì";
            case "79" -> "Nhập sai mật khẩu thanh toán quá số lần quy định";
            default -> "Giao dịch không thành công (Mã phản hồi: " + responseCode + ")";
        };
    }
}

