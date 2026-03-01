package com.finance.app.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record MonthlyReportDto(
        String month,
        int year,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal netBalance,
        BigDecimal savingsRate,
        List<WeeklyBreakdownDto> weeklyBreakdown,
        Map<String, BigDecimal> expenseByCategory,
        List<DailyRunningTotalDto> dailyRunningTotal
) {
    public record WeeklyBreakdownDto(
            String week,
            BigDecimal income,
            BigDecimal expenses
    ) {}

    public record DailyRunningTotalDto(
            int day,
            BigDecimal cumulativeExpenses,
            BigDecimal cumulativeIncome
    ) {}
}
