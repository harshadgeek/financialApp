package com.finance.app.service;

import com.finance.app.dto.DashboardSummaryDto;
import com.finance.app.dto.MonthlyReportDto;
import com.finance.app.dto.WeeklyReportDto;
import com.finance.app.model.Category;
import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.repository.RecurringTransactionRepository;
import com.finance.app.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private RecurringTransactionRepository recurringTransactionRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    void getDashboardSummary_Success() {
        Transaction tx = generateTx();
        when(transactionRepository.findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc(
                eq("testuser"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(tx));

        DashboardSummaryDto summary = reportService.getDashboardSummary("testuser");
        assertNotNull(summary);
    }

    @Test
    void getWeeklyReport_Success() {
        when(transactionRepository.findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc(
                eq("testuser"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

        WeeklyReportDto report = reportService.getWeeklyReport("testuser");
        assertNotNull(report);
    }

    @Test
    void getMonthlyReport_Success() {
        when(transactionRepository.findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc(
                eq("testuser"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

        MonthlyReportDto report = reportService.getMonthlyReport("testuser", 5, 2026);
        assertNotNull(report);
    }

    private Transaction generateTx() {
        return Transaction.builder()
                .id("tx1")
                .amount(new BigDecimal("100.00"))
                .type(TransactionType.EXPENSE)
                .category(Category.FOOD)
                .date(LocalDate.now())
                .createdAt(Instant.now())
                .username("testuser")
                .build();
    }
}
