package com.finance.app.service;

import com.finance.app.model.Transaction;
import com.finance.app.model.User;
import com.finance.app.repository.TransactionRepository;
import com.finance.app.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataSeederServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DataSeederService dataSeederService;

    @Test
    void run_EmptyRepositories_SeedsData() {
        when(userRepository.count()).thenReturn(0L);
        when(transactionRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");

        dataSeederService.run();

        verify(userRepository).save(any(User.class));
        verify(transactionRepository, atLeastOnce()).save(any(Transaction.class));
    }

    @Test
    void run_RepositoriesNotEmpty_DoesNotSeedData() {
        when(userRepository.count()).thenReturn(1L);
        when(transactionRepository.count()).thenReturn(10L);

        dataSeederService.run();

        verify(userRepository, never()).save(any(User.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}
