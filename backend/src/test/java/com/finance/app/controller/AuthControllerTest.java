package com.finance.app.controller;

import com.finance.app.dto.AuthRequest;
import com.finance.app.dto.AuthResponse;
import com.finance.app.dto.RegisterRequest;
import com.finance.app.security.JwtFilter;
import com.finance.app.security.JwtUtil;
import com.finance.app.service.UserService;
import com.finance.app.service.OtpService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private OtpService otpService;

    // JwtFilter and AuthenticationProvider are removed from @MockBean as per instruction
    // They will be provided by the Spring context or mocked implicitly if not needed for the test scope.

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    void register_Success_ReturnsAuthResponse() throws Exception {
        RegisterRequest request = new RegisterRequest("testuser", "test@example.com", "password");
        UserDetails userDetails = new User("testuser", "password", Collections.emptyList());

        when(userService.registerUser(any(RegisterRequest.class))).thenReturn(null);
        when(userService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("dummy-token");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"testuser\", \"email\":\"test@example.com\", \"password\":\"password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("dummy-token"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void login_Success_ReturnsAuthResponse() throws Exception {
        AuthRequest request = new AuthRequest("testuser", "password");
        UserDetails userDetails = new User("testuser", "password", Collections.emptyList());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("dummy-token");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"testuser\", \"password\":\"password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("dummy-token"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void login_Failed_Returns401() throws Exception {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"testuser\", \"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid username or password. Please try again."));
    }

    @Test
    void forgotPassword_EmailExists_SendsOtpSuccessfully() throws Exception {
        when(userService.existsByEmail("test@example.com")).thenReturn(true);
        doNothing().when(otpService).generateAndSendOtp("test@example.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("If the email is registered, a password reset code has been sent."));

        verify(otpService).generateAndSendOtp("test@example.com");
    }

    @Test
    void forgotPassword_EmailDoesNotExist_DoesNotSendOtpButReturnsSuccess() throws Exception {
        when(userService.existsByEmail("unknown@example.com")).thenReturn(false);

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"unknown@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("If the email is registered, a password reset code has been sent."));

        verify(otpService, never()).generateAndSendOtp(anyString());
    }

    @Test
    void forgotPassword_ServiceThrowsException_ReturnsBadRequest() throws Exception {
        when(userService.existsByEmail("test@example.com")).thenReturn(true);
        doThrow(new RuntimeException("Mail delivery failed")).when(otpService).generateAndSendOtp("test@example.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Failed to send OTP: Mail delivery failed"));
    }

    @Test
    void verifyOtp_Success_ReturnsOk() throws Exception {
        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(true);

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\", \"otpCode\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("OTP verification successful."));
    }

    @Test
    void verifyOtp_Failed_ReturnsBadRequest() throws Exception {
        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(false);

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\", \"otpCode\":\"123456\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid or expired OTP. Please try again."));
    }

    @Test
    void resetPassword_Success_ReturnsOk() throws Exception {
        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(true);
        doNothing().when(userService).resetPassword("test@example.com", "NewP@ss123");
        doNothing().when(otpService).clearOtp("test@example.com");

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\", \"otpCode\":\"123456\", \"newPassword\":\"NewP@ss123\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Password reset successfully. You can now login with your new password."));
    }

    @Test
    void resetPassword_InvalidOtp_ReturnsBadRequest() throws Exception {
        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(false);

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\", \"otpCode\":\"123456\", \"newPassword\":\"NewP@ss123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid or expired OTP. Please request a new one."));
    }

    @Test
    void resetPassword_ServiceThrowsException_ReturnsBadRequest() throws Exception {
        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(true);
        doThrow(new IllegalArgumentException("Invalid password complexity")).when(userService).resetPassword("test@example.com", "short");

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\", \"otpCode\":\"123456\", \"newPassword\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid password complexity"));
    }

    @Test
    void resetPassword_DatabaseError_ReturnsGenericBadRequest() throws Exception {
        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(true);
        doThrow(new RuntimeException("Database error")).when(userService).resetPassword("test@example.com", "NewP@ss123");

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\", \"otpCode\":\"123456\", \"newPassword\":\"NewP@ss123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Failed to reset password. Please try again."));
    }
}
