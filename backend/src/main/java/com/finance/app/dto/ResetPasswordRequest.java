package com.finance.app.dto;

public record ResetPasswordRequest(String email, String otpCode, String newPassword) {}
