package com.finance.app.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardSummaryDto(
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal netBalance,
        BigDecimal savingsRate,
        List<MonthlyTrendDto> monthlyTrend,
        Map<String, BigDecimal> expenseByCategory
) {
    public record MonthlyTrendDto(
            String month,
            BigDecimal income,
            BigDecimal expenses
    ) {}
}
