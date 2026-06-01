package com.finance.app.service;

import com.finance.app.model.OtpVerification;
import com.finance.app.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    public void generateAndSendOtp(String email) {
        // Generate a 6-digit numeric OTP
        int code = 100000 + random.nextInt(900000);
        String otpCode = String.valueOf(code);

        // Delete any existing OTP for this email
        otpVerificationRepository.deleteByEmail(email);

        // Expiry set to 10 minutes from now
        Instant expiryTime = Instant.now().plus(10, ChronoUnit.MINUTES);

        OtpVerification otpVerification = OtpVerification.builder()
                .email(email)
                .otpCode(otpCode)
                .expiryTime(expiryTime)
                .build();

        otpVerificationRepository.save(otpVerification);

        // Send OTP
        emailService.sendOtpEmail(email, otpCode);
    }

    public boolean verifyOtp(String email, String otpCode) {
        Optional<OtpVerification> optionalOtp = otpVerificationRepository.findTopByEmailOrderByExpiryTimeDesc(email);

        if (optionalOtp.isEmpty()) {
            return false;
        }

        OtpVerification otp = optionalOtp.get();

        // Check if matching and not expired
        return otp.getOtpCode().equals(otpCode) && Instant.now().isBefore(otp.getExpiryTime());
    }

    public void clearOtp(String email) {
        otpVerificationRepository.deleteByEmail(email);
    }
}
