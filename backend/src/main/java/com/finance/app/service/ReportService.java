package com.finance.app.service;

import com.finance.app.dto.DashboardSummaryDto;
import com.finance.app.dto.MonthlyReportDto;
import com.finance.app.dto.WeeklyReportDto;
import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;

    // ─── Dashboard ────────────────────────────────────────────────────────────

    public DashboardSummaryDto getDashboardSummary(String username) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusMonths(5).withDayOfMonth(1);

        List<Transaction> all = transactionRepository.findByUsernameAndDateBetweenOrderByDateDesc(username, start, today);

        BigDecimal totalIncome = sumByType(all, TransactionType.INCOME);
        BigDecimal totalExpenses = sumByType(all, TransactionType.EXPENSE);
        BigDecimal net = totalIncome.subtract(totalExpenses);
        BigDecimal savingsRate = totalIncome.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : net.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));

        // Monthly trend for last 6 months
        List<DashboardSummaryDto.MonthlyTrendDto> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate mStart = today.withDayOfMonth(1).minusMonths(i);
            LocalDate mEnd = i == 0 ? today : mStart.withDayOfMonth(mStart.lengthOfMonth());
            List<Transaction> monthTx = transactionRepository.findByUsernameAndDateBetweenOrderByDateDesc(username, mStart, mEnd);
            trend.add(new DashboardSummaryDto.MonthlyTrendDto(
                    mStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    sumByType(monthTx, TransactionType.INCOME),
                    sumByType(monthTx, TransactionType.EXPENSE)
            ));
        }

        // Expense by category (current month)
        LocalDate thisMonthStart = today.withDayOfMonth(1);
        List<Transaction> thisMonth = transactionRepository.findByUsernameAndDateBetweenOrderByDateDesc(username, thisMonthStart, today);
        Map<String, BigDecimal> byCategory = thisMonth.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        return new DashboardSummaryDto(
                totalIncome,
                totalExpenses,
                net,
                savingsRate.setScale(1, RoundingMode.HALF_UP),
                trend,
                byCategory
        );
    }

    // ─── Weekly ───────────────────────────────────────────────────────────────

    public WeeklyReportDto getWeeklyReport(String username) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);

        List<Transaction> weekTx = transactionRepository.findByUsernameAndDateBetweenOrderByDateDesc(username, weekStart, weekEnd);

        List<WeeklyReportDto.DailyDataDto> daily = new ArrayList<>();
        for (int d = 0; d < 7; d++) {
            LocalDate day = weekStart.plusDays(d);
            List<Transaction> dayTx = weekTx.stream()
                    .filter(t -> t.getDate().equals(day)).toList();
            daily.add(new WeeklyReportDto.DailyDataDto(
                    day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    day.toString(),
                    sumByType(dayTx, TransactionType.INCOME),
                    sumByType(dayTx, TransactionType.EXPENSE)
            ));
        }

        Map<String, BigDecimal> byCategory = weekTx.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        BigDecimal wIncome = sumByType(weekTx, TransactionType.INCOME);
        BigDecimal wExpenses = sumByType(weekTx, TransactionType.EXPENSE);

        return new WeeklyReportDto(
                wIncome,
                wExpenses,
                wIncome.subtract(wExpenses),
                daily,
                byCategory
        );
    }

    // ─── Monthly ──────────────────────────────────────────────────────────────

    public MonthlyReportDto getMonthlyReport(String username, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        LocalDate today = LocalDate.now();
        LocalDate effectiveEnd = end.isAfter(today) ? today : end;

        List<Transaction> monthTx = transactionRepository.findByUsernameAndDateBetweenOrderByDateDesc(username, start, effectiveEnd);

        BigDecimal totalIncome = sumByType(monthTx, TransactionType.INCOME);
        BigDecimal totalExpenses = sumByType(monthTx, TransactionType.EXPENSE);
        BigDecimal net = totalIncome.subtract(totalExpenses);
        BigDecimal savingsRate = totalIncome.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : net.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));

        // Weekly breakdown
        List<MonthlyReportDto.WeeklyBreakdownDto> weeklyBreakdown = new ArrayList<>();
        for (int w = 0; w < 5; w++) {
            LocalDate wStart = start.plusDays((long) w * 7);
            LocalDate wEnd = wStart.plusDays(6).isAfter(effectiveEnd) ? effectiveEnd : wStart.plusDays(6);
            if (wStart.isAfter(effectiveEnd)) break;
            List<Transaction> wk = monthTx.stream()
                    .filter(t -> !t.getDate().isBefore(wStart) && !t.getDate().isAfter(wEnd))
                    .toList();
            weeklyBreakdown.add(new MonthlyReportDto.WeeklyBreakdownDto(
                    "Week " + (w + 1),
                    sumByType(wk, TransactionType.INCOME),
                    sumByType(wk, TransactionType.EXPENSE)
            ));
        }

        // Daily running total
        List<MonthlyReportDto.DailyRunningTotalDto> runningTotals = new ArrayList<>();
        BigDecimal cumExp = BigDecimal.ZERO;
        BigDecimal cumInc = BigDecimal.ZERO;
        for (int d = 1; d <= effectiveEnd.getDayOfMonth(); d++) {
            LocalDate day = start.withDayOfMonth(d);
            List<Transaction> dayTx = monthTx.stream().filter(t -> t.getDate().equals(day)).toList();
            cumExp = cumExp.add(sumByType(dayTx, TransactionType.EXPENSE));
            cumInc = cumInc.add(sumByType(dayTx, TransactionType.INCOME));
            runningTotals.add(new MonthlyReportDto.DailyRunningTotalDto(d, cumExp, cumInc));
        }

        Map<String, BigDecimal> byCategory = monthTx.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        return new MonthlyReportDto(
                start.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                year,
                totalIncome,
                totalExpenses,
                net,
                savingsRate.setScale(1, RoundingMode.HALF_UP),
                weeklyBreakdown,
                byCategory,
                runningTotals
        );
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private BigDecimal sumByType(List<Transaction> txList, TransactionType type) {
        return txList.stream()
                .filter(t -> t.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
