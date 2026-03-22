package com.finance.app.service;

import com.finance.app.dto.BudgetStatusDto;
import com.finance.app.model.Budget;
import com.finance.app.model.Category;
import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.repository.BudgetRepository;
import com.finance.app.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private BudgetService budgetService;

    private Budget budget;

    @BeforeEach
    void setUp() {
        budget = Budget.builder()
                .id("1")
                .username("testuser")
                .category(Category.FOOD)
                .monthlyLimit(new BigDecimal("500.00"))
                .build();
    }

    @Test
    void getBudgets_Success() {
        when(budgetRepository.findAllByUsername("testuser")).thenReturn(Arrays.asList(budget));
        List<Budget> result = budgetService.getBudgets("testuser");
        assertEquals(1, result.size());
        assertEquals(Category.FOOD, result.get(0).getCategory());
    }

    @Test
    void upsertBudget_Existing_Success() {
        when(budgetRepository.findByUsernameAndCategory("testuser", Category.FOOD))
                .thenReturn(Optional.of(budget));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(i -> i.getArgument(0));

        Budget result = budgetService.upsertBudget("testuser", Category.FOOD, new BigDecimal("600.00"));
        assertEquals(new BigDecimal("600.00"), result.getMonthlyLimit());
    }

    @Test
    void upsertBudget_New_Success() {
        when(budgetRepository.findByUsernameAndCategory("testuser", Category.RENT))
                .thenReturn(Optional.empty());
        when(budgetRepository.save(any(Budget.class))).thenAnswer(i -> i.getArgument(0));

        Budget result = budgetService.upsertBudget("testuser", Category.RENT, new BigDecimal("1000.00"));
        assertEquals(Category.RENT, result.getCategory());
        assertEquals(new BigDecimal("1000.00"), result.getMonthlyLimit());
    }

    @Test
    void deleteBudget_Success() {
        budgetService.deleteBudget("testuser", Category.FOOD);
        verify(budgetRepository).deleteByUsernameAndCategory("testuser", Category.FOOD);
    }

    @Test
    void getBudgetStatus_Success() {
        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        Transaction tx = Transaction.builder()
                .id("tx1")
                .amount(new BigDecimal("100.00"))
                .type(TransactionType.EXPENSE)
                .category(Category.FOOD)
                .date(LocalDate.now())
                .createdAt(Instant.now())
                .username("testuser")
                .build();

        when(budgetRepository.findAllByUsername("testuser")).thenReturn(Arrays.asList(budget));
        when(transactionRepository.findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc("testuser", start, end))
                .thenReturn(Arrays.asList(tx));

        List<BudgetStatusDto> result = budgetService.getBudgetStatus("testuser", month, year);

        assertEquals(1, result.size());
        assertEquals("FOOD", result.get(0).category());
        assertEquals(new BigDecimal("500.00"), result.get(0).monthlyLimit());
        assertEquals(new BigDecimal("100.00"), result.get(0).spent());
        assertEquals("OK", result.get(0).status());
    }
}
