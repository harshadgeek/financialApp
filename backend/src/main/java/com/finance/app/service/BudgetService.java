package com.finance.app.service;

import com.finance.app.dto.BudgetStatusDto;
import com.finance.app.model.Budget;
import com.finance.app.model.Category;
import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.repository.BudgetRepository;
import com.finance.app.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public List<Budget> getBudgets(String username) {
        return budgetRepository.findAllByUsername(username);
    }

    public Budget upsertBudget(String username, Category category, BigDecimal monthlyLimit) {
        Budget budget = budgetRepository.findByUsernameAndCategory(username, category)
                .orElse(Budget.builder().username(username).category(category).build());
        budget.setMonthlyLimit(monthlyLimit);
        return budgetRepository.save(budget);
    }

    public void deleteBudget(String username, Category category) {
        budgetRepository.deleteByUsernameAndCategory(username, category);
    }

    public List<BudgetStatusDto> getBudgetStatus(String username, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Transaction> txs = transactionRepository
                .findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDesc(username, start, end);

        return budgetRepository.findAllByUsername(username).stream().map(budget -> {
            BigDecimal spent = txs.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE && t.getCategory() == budget.getCategory())
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String status;
            if (budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) == 0) {
                status = "OK";
            } else {
                BigDecimal ratio = spent.divide(budget.getMonthlyLimit(), 4, RoundingMode.HALF_UP);
                if (ratio.compareTo(BigDecimal.ONE) > 0) status = "OVER";
                else if (ratio.compareTo(new BigDecimal("0.75")) >= 0) status = "WARNING";
                else status = "OK";
            }

            return new BudgetStatusDto(budget.getCategory().name(), budget.getMonthlyLimit(), spent, status);
        }).toList();
    }
}
