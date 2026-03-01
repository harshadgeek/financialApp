package com.finance.app.controller;

import com.finance.app.model.Budget;
import com.finance.app.model.Category;
import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.repository.BudgetRepository;
import com.finance.app.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.security.Principal;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping
    public List<Map<String, Object>> getBudgets(
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year,
            Principal principal) {

        String username = principal.getName();
        LocalDate now = LocalDate.now();
        int m = month == 0 ? now.getMonthValue() : month;
        int y = year == 0 ? now.getYear() : year;

        LocalDate start = LocalDate.of(y, m, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        LocalDate effectiveEnd = end.isAfter(now) ? now : end;

        List<Transaction> monthTx = transactionRepository.findByUsernameAndDateBetweenOrderByDateDesc(username, start, effectiveEnd);
        Map<Category, BigDecimal> spendMap = monthTx.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<Budget> budgets = budgetRepository.findByUsernameAndMonthAndYear(username, m, y);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Budget b : budgets) {
            BigDecimal spent = spendMap.getOrDefault(b.getCategory(), BigDecimal.ZERO);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", b.getId());
            entry.put("category", b.getCategory().name());
            entry.put("monthlyLimit", b.getMonthlyLimit());
            entry.put("currentSpend", spent);
            entry.put("remaining", b.getMonthlyLimit().subtract(spent));
            entry.put("percentage", b.getMonthlyLimit().compareTo(BigDecimal.ZERO) == 0 ? 0
                    : spent.multiply(BigDecimal.valueOf(100)).divide(b.getMonthlyLimit(), 1, java.math.RoundingMode.HALF_UP));
            result.add(entry);
        }

        return result;
    }

    @PostMapping
    public ResponseEntity<Budget> upsertBudget(@RequestBody Budget budget, Principal principal) {
        String username = principal.getName();
        LocalDate now = LocalDate.now();
        int m = budget.getMonth() == 0 ? now.getMonthValue() : budget.getMonth();
        int y = budget.getYear() == 0 ? now.getYear() : budget.getYear();

        Optional<Budget> existing = budgetRepository.findByUsernameAndCategoryAndMonthAndYear(username, budget.getCategory(), m, y);
        if (existing.isPresent()) {
            Budget b = existing.get();
            b.setMonthlyLimit(budget.getMonthlyLimit());
            return ResponseEntity.ok(budgetRepository.save(b));
        }
        budget.setMonth(m);
        budget.setYear(y);
        budget.setUsername(username);
        return ResponseEntity.ok(budgetRepository.save(budget));
    }
}
