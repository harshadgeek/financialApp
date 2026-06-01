package com.finance.app.service;

import com.finance.app.dto.RegisterRequest;
import com.finance.app.dto.UserDto;
import com.finance.app.model.User;
import com.finance.app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id("1")
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .build();
    }

    @Test
    void registerUser_Success() {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "P@ssword123");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("P@ssword123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = userService.registerUser(request);

        assertNotNull(result);
        assertEquals("newuser", result.getUsername());
        assertEquals("new@example.com", result.getEmail());
        assertEquals("encodedPassword", result.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_UsernameTaken_ThrowsException() {
        RegisterRequest request = new RegisterRequest("testuser", "new@example.com", "P@ssword123");
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_EmailTaken_ThrowsException() {
        RegisterRequest request = new RegisterRequest("newuser", "test@example.com", "P@ssword123");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loadUserByUsername_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserDetails details = userService.loadUserByUsername("testuser");

        assertEquals("testuser", details.getUsername());
        assertEquals("encodedPassword", details.getPassword());
    }

    @Test
    void loadUserByUsername_NotFound_ThrowsException() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userService.loadUserByUsername("unknown"));
    }

    @Test
    void getProfile_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserDto profile = userService.getProfile("testuser");

        assertEquals("testuser", profile.getUsername());
        assertEquals("test@example.com", profile.getEmail());
    }

    @Test
    void updateProfilePicture_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        User result = userService.updateProfilePicture("testuser", "http://example.com/pic.jpg");

        assertEquals("http://example.com/pic.jpg", result.getProfilePictureUrl());
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("P@ssword123")).thenReturn("newEncodedPass");

        userService.changePassword("testuser", "oldPass", "P@ssword123");

        assertEquals("newEncodedPass", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_WrongCurrentPassword_ThrowsException() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPass", "encodedPassword")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> userService.changePassword("testuser", "wrongPass", "P@ssword123"));
        verify(userRepository, never()).save(user);
    }

    @Test
    void changePassword_ShortNewPassword_ThrowsException() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "encodedPassword")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.changePassword("testuser", "oldPass", "short"));
        verify(userRepository, never()).save(user);
    }

    @Test
    void existsByEmail_ReturnsTrue() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
        boolean exists = userService.existsByEmail("test@example.com");
        assertTrue(exists);
    }
    @Test
    void existsByEmail_ReturnsFalse() {
        when(userRepository.existsByEmail("unknown@example.com")).thenReturn(false);
        boolean exists = userService.existsByEmail("unknown@example.com");
        assertFalse(exists);
    }

    @Test
    void resetPassword_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewP@ss123")).thenReturn("newEncodedPass");

        userService.resetPassword("test@example.com", "NewP@ss123");

        assertEquals("newEncodedPass", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void resetPassword_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userService.resetPassword("unknown@example.com", "NewP@ss123"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPassword_InvalidNewPassword_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> userService.resetPassword("test@example.com", "short"));
        verify(userRepository, never()).save(any(User.class));
    }
}
