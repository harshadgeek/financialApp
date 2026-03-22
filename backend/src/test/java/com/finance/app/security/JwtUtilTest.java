package com.finance.app.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "mysecretmysecretmysecretmysecretmysecretmysecretmysecretmysecret";
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(secret);
        userDetails = new User("testuser", "password", Collections.emptyList());
    }

    @Test
    void generateToken_Success() {
        String token = jwtUtil.generateToken(userDetails);
        assertNotNull(token);
        assertEquals("testuser", jwtUtil.extractUsername(token));
    }

    @Test
    void validateToken_ValidToken_ReturnsTrue() {
        String token = jwtUtil.generateToken(userDetails);
        assertTrue(jwtUtil.validateToken(token, userDetails));
    }

    @Test
    void validateToken_InvalidUser_ReturnsFalse() {
        String token = jwtUtil.generateToken(userDetails);
        UserDetails otherUser = new User("other", "password", Collections.emptyList());
        assertFalse(jwtUtil.validateToken(token, otherUser));
    }

    @Test
    void extractExpiration_ReturnsFutureDate() {
        String token = jwtUtil.generateToken(userDetails);
        Date expiration = jwtUtil.extractExpiration(token);
        assertTrue(expiration.after(new Date()));
    }
}
