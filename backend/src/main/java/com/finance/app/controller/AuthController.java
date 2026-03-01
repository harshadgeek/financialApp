package com.finance.app.controller;

import com.finance.app.dto.AuthRequest;
import com.finance.app.dto.AuthResponse;
import com.finance.app.dto.RegisterRequest;
import com.finance.app.security.JwtUtil;
import com.finance.app.service.UserService;
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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            userService.registerUser(request);
            
            // Auto login after registration
            UserDetails userDetails = userService.loadUserByUsername(request.username());
            String token = jwtUtil.generateToken(userDetails);
            
            return ResponseEntity.ok(new AuthResponse(token, request.username()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        final UserDetails userDetails = userService.loadUserByUsername(request.username());
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt, request.username()));
    }
}
