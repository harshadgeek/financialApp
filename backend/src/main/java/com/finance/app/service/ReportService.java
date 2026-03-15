package com.finance.app.service;

import com.finance.app.dto.DashboardSummaryDto;
import com.finance.app.dto.FutureProjectionDto;
import com.finance.app.dto.MonthlyReportDto;
import com.finance.app.dto.WeeklyReportDto;
import com.finance.app.model.RecurringFrequency;
import com.finance.app.model.RecurringTransaction;
import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.repository.RecurringTransactionRepository;
import com.finance.app.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;

    // ─── Dashboard ────────────────────────────────────────────────────────────

    public DashboardSummaryDto getDashboardSummary(String username) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusMonths(5).withDayOfMonth(1);

        List<Transaction> all = transactionRepository.findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc(username, start, today);

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
            List<Transaction> monthTx = transactionRepository.findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc(username, mStart, mEnd);
            trend.add(new DashboardSummaryDto.MonthlyTrendDto(
                    mStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    sumByType(monthTx, TransactionType.INCOME),
                    sumByType(monthTx, TransactionType.EXPENSE)
            ));
        }

        // Expense by category (current month)
        LocalDate thisMonthStart = today.withDayOfMonth(1);
        List<Transaction> thisMonth = transactionRepository.findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc(username, thisMonthStart, today);
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

        List<Transaction> weekTx = transactionRepository.findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc(username, weekStart, weekEnd);

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

        List<Transaction> monthTx = transactionRepository.findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc(username, start, effectiveEnd);

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

    public FutureProjectionDto getFutureProjection(String username, LocalDate targetDate) {
        log.info("Calculating future projection for user: {} up to {}", username, targetDate);
        LocalDate today = LocalDate.now();
        if (targetDate.isBefore(today)) targetDate = today.plusMonths(1);

        // 1. Current Balance
        List<Transaction> allHistory = transactionRepository.findAllByUsernameOrderByDateDescCreatedAtDesc(username);
        BigDecimal currentBalance = allHistory.stream()
                .filter(t -> t.getAmount() != null)
                .map(t -> t.getType() == TransactionType.INCOME ? t.getAmount() : t.getAmount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.debug("Current balance for {}: {}", username, currentBalance);

        // 2. Projections
        List<RecurringTransaction> actives = recurringTransactionRepository.findAllByUsername(username).stream()
                .filter(rt -> rt != null && rt.isActive() && rt.getAmount() != null && rt.getFrequency() != null)
                .collect(Collectors.toList());

        log.debug("Found {} active recurring transactions for {}", actives.size(), username);

        BigDecimal totalProjectedIncome = BigDecimal.ZERO;
        BigDecimal totalProjectedExpenses = BigDecimal.ZERO;
        List<FutureProjectionDto.ProjectedDataPointDto> trend = new ArrayList<>();

        // We'll iterate day by day to build the trend line
        BigDecimal runningBalance = currentBalance;
        
        // Add start point
        trend.add(new FutureProjectionDto.ProjectedDataPointDto(today.toString(), runningBalance, BigDecimal.ZERO, BigDecimal.ZERO));

        for (LocalDate date = today.plusDays(1); !date.isAfter(targetDate); date = date.plusDays(1)) {
            BigDecimal dayIncome = BigDecimal.ZERO;
            BigDecimal dayExpense = BigDecimal.ZERO;

            for (RecurringTransaction rt : actives) {
                if (isExecutingOn(rt, date)) {
                    if (rt.getType() == TransactionType.INCOME) {
                        dayIncome = dayIncome.add(rt.getAmount());
                    } else {
                        dayExpense = dayExpense.add(rt.getAmount());
                    }
                }
            }

            if (dayIncome.compareTo(BigDecimal.ZERO) > 0 || dayExpense.compareTo(BigDecimal.ZERO) > 0) {
                totalProjectedIncome = totalProjectedIncome.add(dayIncome);
                totalProjectedExpenses = totalProjectedExpenses.add(dayExpense);
                runningBalance = runningBalance.add(dayIncome).subtract(dayExpense);
                
                trend.add(new FutureProjectionDto.ProjectedDataPointDto(
                        date.toString(),
                        runningBalance,
                        dayIncome,
                        dayExpense
                ));
            }
        }

        // Add final point if not already there
        if (trend.get(trend.size()-1).getDate().equals(targetDate.toString())) {
             // already added
        } else {
             trend.add(new FutureProjectionDto.ProjectedDataPointDto(targetDate.toString(), runningBalance, BigDecimal.ZERO, BigDecimal.ZERO));
        }

        return new FutureProjectionDto(
                currentBalance,
                totalProjectedIncome,
                totalProjectedExpenses,
                runningBalance,
                trend
        );
    }

    private boolean isExecutingOn(RecurringTransaction rt, LocalDate date) {
        if (rt == null || rt.getFrequency() == null) return false;
        if (rt.getStartDate() != null && date.isBefore(rt.getStartDate())) return false;
        if (rt.getEndDate() != null && date.isAfter(rt.getEndDate())) return false;
        
        // This is a simplified projection. A robust one would handle every execution date correctly.
        // For projection, we calculate if 'date' is a multiple of frequency from 'startDate'
        LocalDate current = rt.getStartDate() != null ? rt.getStartDate() : LocalDate.now();
        
        // To avoid infinite loops or heavy computation, we use logic based on frequency
        try {
            switch (rt.getFrequency()) {
                case DAILY: return true;
                case WEEKLY: return current.getDayOfWeek() == date.getDayOfWeek();
                case MONTHLY: return current.getDayOfMonth() == date.getDayOfMonth() || 
                                    (date.getDayOfMonth() == date.lengthOfMonth() && current.getDayOfMonth() > date.lengthOfMonth());
                case YEARLY: return current.getMonth() == date.getMonth() && current.getDayOfMonth() == date.getDayOfMonth();
                default: return false;
            }
        } catch (java.time.DateTimeException e) {
            log.warn("Error checking execution for recurring tx: {}", rt.getId(), e);
            return false;
        }
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private BigDecimal sumByType(List<Transaction> txList, TransactionType type) {
        return txList.stream()
                .filter(t -> t.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
