package com.finance.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FutureProjectionDto {
    private BigDecimal currentBalance;
    private BigDecimal projectedIncome;
    private BigDecimal projectedExpenses;
    private BigDecimal projectedFinalBalance;
    private List<ProjectedDataPointDto> trend;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProjectedDataPointDto {
        private String date;
        private BigDecimal balance;
        private BigDecimal income;
        private BigDecimal expenses;
    }
}
