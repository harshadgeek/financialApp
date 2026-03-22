package com.finance.app.service;

import com.finance.app.model.Category;
import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction tx1;
    private Transaction tx2;

    @BeforeEach
    void setUp() {
        tx1 = Transaction.builder()
                .id("1")
                .username("testuser")
                .amount(new BigDecimal("100.00"))
                .type(TransactionType.INCOME)
                .category(Category.SALARY)
                .description("Monthly salary")
                .date(LocalDate.now())
                .createdAt(Instant.now())
                .build();

        tx2 = Transaction.builder()
                .id("2")
                .username("otheruser")
                .amount(new BigDecimal("50.00"))
                .type(TransactionType.EXPENSE)
                .category(Category.FOOD)
                .description("Lunch")
                .date(LocalDate.now())
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void getAllTransactions_ReturnsLists() {
        when(transactionRepository.findAllByUsernameOrderByDateDescCreatedAtDesc("testuser"))
                .thenReturn(Arrays.asList(tx1));

        List<Transaction> result = transactionService.getAllTransactions("testuser");

        assertEquals(1, result.size());
        assertEquals("testuser", result.get(0).getUsername());
        verify(transactionRepository).findAllByUsernameOrderByDateDescCreatedAtDesc("testuser");
    }

    @Test
    void addTransaction_ReturnsSavedTransaction() {
        when(transactionRepository.save(any(Transaction.class))).thenReturn(tx1);

        Transaction result = transactionService.addTransaction(tx1);

        assertNotNull(result);
        assertEquals(tx1.getId(), result.getId());
        verify(transactionRepository).save(tx1);
    }

    @Test
    void updateTransaction_Success() {
        when(transactionRepository.findById("1")).thenReturn(Optional.of(tx1));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

        Transaction updateReq = Transaction.builder()
                .amount(new BigDecimal("200.00"))
                .type(TransactionType.INCOME)
                .category(Category.OTHER)
                .description("Year end bonus")
                .date(LocalDate.now())
                .build();

        Transaction result = transactionService.updateTransaction("1", updateReq, "testuser");

        assertEquals(new BigDecimal("200.00"), result.getAmount());
        assertEquals(Category.OTHER, result.getCategory());
        assertEquals("Year end bonus", result.getDescription());
        verify(transactionRepository).save(tx1);
    }

    @Test
    void updateTransaction_Unauthorized_ThrowsException() {
        when(transactionRepository.findById("1")).thenReturn(Optional.of(tx1));

        assertThrows(AccessDeniedException.class, () -> 
            transactionService.updateTransaction("1", tx1, "wronguser"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void deleteTransaction_Success() {
        when(transactionRepository.findById("1")).thenReturn(Optional.of(tx1));

        transactionService.deleteTransaction("1", "testuser");

        verify(transactionRepository).deleteById("1");
    }

    @Test
    void deleteTransaction_Unauthorized_ThrowsException() {
        when(transactionRepository.findById("1")).thenReturn(Optional.of(tx1));

        assertThrows(AccessDeniedException.class, () -> 
            transactionService.deleteTransaction("1", "wronguser"));
        verify(transactionRepository, never()).deleteById(anyString());
    }

    @Test
    void getById_NotFound_ThrowsException() {
        when(transactionRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> transactionService.getById("unknown"));
    }
}
