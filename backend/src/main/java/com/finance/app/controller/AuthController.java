package com.finance.app.controller;

import com.finance.app.dto.AuthRequest;
import com.finance.app.dto.AuthResponse;
import com.finance.app.dto.RegisterRequest;
import com.finance.app.dto.ForgotPasswordRequest;
import com.finance.app.dto.VerifyOtpRequest;
import com.finance.app.dto.ResetPasswordRequest;
import com.finance.app.security.JwtUtil;
import com.finance.app.service.UserService;
import com.finance.app.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            userService.registerUser(request);
            
            // Auto login after registration
            UserDetails userDetails = userService.loadUserByUsername(request.username());
            String token = jwtUtil.generateToken(userDetails);
            
            return ResponseEntity.ok(new AuthResponse(token, request.username()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(401).body("Invalid username or password. Please try again.");
        }

        final UserDetails userDetails = userService.loadUserByUsername(request.username());
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt, request.username()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (!userService.existsByEmail(request.email())) {
            // Prevent enumeration, say success anyway
            return ResponseEntity.ok("If the email is registered, a password reset code has been sent.");
        }
        
        try {
            otpService.generateAndSendOtp(request.email());
            return ResponseEntity.ok("If the email is registered, a password reset code has been sent.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send OTP: " + e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean isValid = otpService.verifyOtp(request.email(), request.otpCode());
        if (isValid) {
            return ResponseEntity.ok("OTP verification successful.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired OTP. Please try again.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean isValid = otpService.verifyOtp(request.email(), request.otpCode());
        if (!isValid) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP. Please request a new one.");
        }

        try {
            userService.resetPassword(request.email(), request.newPassword());
            otpService.clearOtp(request.email());
            return ResponseEntity.ok("Password reset successfully. You can now login with your new password.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reset password. Please try again.");
        }
    }
}
