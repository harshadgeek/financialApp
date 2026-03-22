package com.finance.app.service;

import com.finance.app.model.Category;
import com.finance.app.model.RecurringFrequency;
import com.finance.app.model.RecurringTransaction;
import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.repository.RecurringTransactionRepository;
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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecurringTransactionServiceTest {

    @Mock
    private RecurringTransactionRepository recurringTransactionRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private RecurringTransactionService recurringTransactionService;

    private RecurringTransaction rt;

    @BeforeEach
    void setUp() {
        rt = RecurringTransaction.builder()
                .id("1")
                .username("testuser")
                .amount(new BigDecimal("50.00"))
                .type(TransactionType.EXPENSE)
                .category(Category.ENTERTAINMENT)
                .description("Netflix")
                .frequency(RecurringFrequency.MONTHLY)
                .startDate(LocalDate.now())
                .nextExecutionDate(LocalDate.now())
                .active(true)
                .build();
    }

    @Test
    void getAll_Success() {
        when(recurringTransactionRepository.findAllByUsername("testuser")).thenReturn(Arrays.asList(rt));
        List<RecurringTransaction> result = recurringTransactionService.getAll("testuser");
        assertEquals(1, result.size());
    }

    @Test
    void create_Success() {
        when(recurringTransactionRepository.save(any(RecurringTransaction.class))).thenAnswer(i -> i.getArgument(0));
        RecurringTransaction result = recurringTransactionService.create(rt);
        assertNotNull(result.getStartDate());
        assertNotNull(result.getNextExecutionDate());
    }

    @Test
    void update_Success() {
        when(recurringTransactionRepository.findById("1")).thenReturn(Optional.of(rt));
        when(recurringTransactionRepository.save(any(RecurringTransaction.class))).thenAnswer(i -> i.getArgument(0));

        RecurringTransaction req = RecurringTransaction.builder()
                .amount(new BigDecimal("100.00"))
                .category(Category.SHOPPING)
                .build();

        RecurringTransaction result = recurringTransactionService.update("1", req, "testuser");
        assertEquals(new BigDecimal("100.00"), result.getAmount());
        assertEquals(Category.SHOPPING, result.getCategory());
    }

    @Test
    void update_Unauthorized_ThrowsException() {
        when(recurringTransactionRepository.findById("1")).thenReturn(Optional.of(rt));
        assertThrows(AccessDeniedException.class, () -> recurringTransactionService.update("1", rt, "wronguser"));
    }

    @Test
    void delete_Success() {
        when(recurringTransactionRepository.findById("1")).thenReturn(Optional.of(rt));
        recurringTransactionService.delete("1", "testuser");
        verify(recurringTransactionRepository).deleteById("1");
    }

    @Test
    void processRecurringTransactions_Success() {
        when(recurringTransactionRepository.findByActiveTrueAndNextExecutionDateLessThanEqual(any(LocalDate.class)))
                .thenReturn(Arrays.asList(rt));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(new Transaction());
        when(recurringTransactionRepository.save(any(RecurringTransaction.class))).thenReturn(rt);

        recurringTransactionService.processRecurringTransactions();

        verify(transactionRepository).save(any(Transaction.class));
        verify(recurringTransactionRepository).save(rt);
        
        LocalDate expectedNext = LocalDate.now().plusMonths(1);
        assertEquals(expectedNext, rt.getNextExecutionDate());
    }
}
