package com.finance.app.dto;

import java.math.BigDecimal;

public record BudgetStatusDto(
        String category,
        BigDecimal monthlyLimit,
        BigDecimal spent,
        String status  // "OK", "WARNING", "OVER"
) {}
