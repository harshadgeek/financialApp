package com.finance.app.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.mock:false}")
    private boolean mockEnabled;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        if (mockEnabled || mailUsername == null || mailUsername.trim().isEmpty()) {
            logMockOtp(toEmail, otpCode);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername);
            helper.setTo(toEmail);
            helper.setSubject("FinanceIQ - Reset Your Password");
            
            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0;'>" +
                    "  <div style='max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e4e4e7;'>" +
                    "    <div style='background: linear-gradient(135deg, #4f8ef7, #a78bfa); padding: 30px; text-align: center; color: #ffffff;'>" +
                    "      <h1 style='margin: 0; font-size: 28px; font-weight: bold;'>finance<span style='color: #22d3ee;'>iq</span></h1>" +
                    "      <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;'>Smart Personal Finance Assistant</p>" +
                    "    </div>" +
                    "    <div style='padding: 30px; color: #3f3f46; line-height: 1.6;'>" +
                    "      <h2 style='color: #18181b; font-size: 20px; margin-top: 0;'>Password Reset Request</h2>" +
                    "      <p>Hello,</p>" +
                    "      <p>We received a request to reset your password for your FinanceIQ account. Use the following One-Time Password (OTP) to proceed. This code is valid for <strong>10 minutes</strong>.</p>" +
                    "      " +
                    "      <div style='text-align: center; margin: 30px 0;'>" +
                    "        <span style='display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f8ef7; background: #eff6ff; padding: 12px 30px; border-radius: 8px; border: 1px dashed #bfdbfe;'>" + otpCode + "</span>" +
                    "      </div>" +
                    "      " +
                    "      <p style='font-size: 14px; color: #71717a;'>If you did not request this change, you can safely ignore this email. Your password will remain unchanged.</p>" +
                    "    </div>" +
                    "    <div style='background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #e4e4e7; color: #a1a1aa; font-size: 12px;'>" +
                    "      &copy; 2026 FinanceIQ. All rights reserved." +
                    "    </div>" +
                    "  </div>" +
                    "</body>" +
                    "</html>";
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Successfully sent OTP email to {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send real OTP email to {}, falling back to console mock delivery.", toEmail, e);
            logMockOtp(toEmail, otpCode);
        }
    }

    private void logMockOtp(String toEmail, String otpCode) {
        System.out.println("\n");
        System.out.println("========================================================================================");
        System.out.println("   [DEVELOPER MOCK EMAIL SERVICE] \u2014 NO COST & NO SETUP FALLBACK ACTIVE");
        System.out.println("========================================================================================");
        System.out.println("   To:      " + toEmail);
        System.out.println("   Subject: FinanceIQ - Password Reset OTP");
        System.out.println("   ------------------------------------------------------------------");
        System.out.println("   Your One-Time Password (OTP) is:   " + otpCode);
        System.out.println("   Expiry:                            Valid for 10 minutes");
        System.out.println("   ------------------------------------------------------------------");
        System.out.println("   (Tip: Copy this code and enter it on the frontend verification stage)");
        System.out.println("========================================================================================\n");
    }
}
