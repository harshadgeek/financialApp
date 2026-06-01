package com.finance.app.service;

import com.finance.app.model.OtpVerification;
import com.finance.app.repository.OtpVerificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpVerificationRepository otpVerificationRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private OtpService otpService;

    private OtpVerification otpVerification;

    @BeforeEach
    void setUp() {
        otpVerification = OtpVerification.builder()
                .id("1")
                .email("test@example.com")
                .otpCode("123456")
                .expiryTime(Instant.now().plus(10, ChronoUnit.MINUTES))
                .build();
    }

    @Test
    void generateAndSendOtp_Success() {
        ArgumentCaptor<OtpVerification> otpCaptor = ArgumentCaptor.forClass(OtpVerification.class);

        otpService.generateAndSendOtp("test@example.com");

        verify(otpVerificationRepository).deleteByEmail("test@example.com");
        verify(otpVerificationRepository).save(otpCaptor.capture());
        
        OtpVerification savedOtp = otpCaptor.getValue();
        assertEquals("test@example.com", savedOtp.getEmail());
        assertNotNull(savedOtp.getOtpCode());
        assertEquals(6, savedOtp.getOtpCode().length());
        assertTrue(Instant.now().isBefore(savedOtp.getExpiryTime()));

        verify(emailService).sendOtpEmail(eq("test@example.com"), eq(savedOtp.getOtpCode()));
    }

    @Test
    void verifyOtp_Success() {
        when(otpVerificationRepository.findTopByEmailOrderByExpiryTimeDesc("test@example.com"))
                .thenReturn(Optional.of(otpVerification));

        boolean isValid = otpService.verifyOtp("test@example.com", "123456");

        assertTrue(isValid);
    }

    @Test
    void verifyOtp_WrongCode_ReturnsFalse() {
        when(otpVerificationRepository.findTopByEmailOrderByExpiryTimeDesc("test@example.com"))
                .thenReturn(Optional.of(otpVerification));

        boolean isValid = otpService.verifyOtp("test@example.com", "000000");

        assertFalse(isValid);
    }

    @Test
    void verifyOtp_Expired_ReturnsFalse() {
        otpVerification.setExpiryTime(Instant.now().minus(1, ChronoUnit.MINUTES));
        when(otpVerificationRepository.findTopByEmailOrderByExpiryTimeDesc("test@example.com"))
                .thenReturn(Optional.of(otpVerification));

        boolean isValid = otpService.verifyOtp("test@example.com", "123456");

        assertFalse(isValid);
    }

    @Test
    void verifyOtp_NotFound_ReturnsFalse() {
        when(otpVerificationRepository.findTopByEmailOrderByExpiryTimeDesc("unknown@example.com"))
                .thenReturn(Optional.empty());

        boolean isValid = otpService.verifyOtp("unknown@example.com", "123456");

        assertFalse(isValid);
    }

    @Test
    void clearOtp_Success() {
        otpService.clearOtp("test@example.com");
        verify(otpVerificationRepository).deleteByEmail("test@example.com");
    }
}
