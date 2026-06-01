package com.finance.app.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        // By default, set mockEnabled to false and mailUsername to a valid email
        ReflectionTestUtils.setField(emailService, "mailUsername", "sender@gmail.com");
        ReflectionTestUtils.setField(emailService, "mockEnabled", false);
    }

    @Test
    void sendOtpEmail_Success() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendOtpEmail("recipient@example.com", "123456");

        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendOtpEmail_MockEnabled_SkipsRealEmail() {
        ReflectionTestUtils.setField(emailService, "mockEnabled", true);

        emailService.sendOtpEmail("recipient@example.com", "123456");

        verifyNoInteractions(mailSender);
    }

    @Test
    void sendOtpEmail_UsernameEmpty_SkipsRealEmail() {
        ReflectionTestUtils.setField(emailService, "mailUsername", "");

        emailService.sendOtpEmail("recipient@example.com", "123456");

        verifyNoInteractions(mailSender);
    }

    @Test
    void sendOtpEmail_UsernameNull_SkipsRealEmail() {
        ReflectionTestUtils.setField(emailService, "mailUsername", null);

        emailService.sendOtpEmail("recipient@example.com", "123456");

        verifyNoInteractions(mailSender);
    }

    @Test
    void sendOtpEmail_SenderThrowsException_FallsBackToMock() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("Mail server down")).when(mailSender).send(any(MimeMessage.class));

        // Should not throw exception, but handle gracefully and fall back to mock
        assertDoesNotThrow(() -> emailService.sendOtpEmail("recipient@example.com", "123456"));

        verify(mailSender).send(mimeMessage);
    }
}
