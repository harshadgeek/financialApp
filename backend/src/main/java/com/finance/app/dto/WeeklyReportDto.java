package com.finance.app.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record WeeklyReportDto(
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal netBalance,
        List<DailyDataDto> dailyData,
        Map<String, BigDecimal> expenseByCategory
) {
    public record DailyDataDto(
            String day,
            String date,
            BigDecimal income,
            BigDecimal expenses
    ) {}
}
