package com.finance.app.controller;

import com.finance.app.dto.BudgetStatusDto;
import com.finance.app.model.Budget;
import com.finance.app.model.Category;
import com.finance.app.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public List<Budget> getBudgets(@AuthenticationPrincipal UserDetails user) {
        return budgetService.getBudgets(user.getUsername());
    }

    @PostMapping
    public Budget upsertBudget(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, Object> body
    ) {
        Category category = Category.valueOf((String) body.get("category"));
        BigDecimal limit = new BigDecimal(body.get("monthlyLimit").toString());
        return budgetService.upsertBudget(user.getUsername(), category, limit);
    }

    @DeleteMapping("/{category}")
    public ResponseEntity<Void> deleteBudget(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String category
    ) {
        budgetService.deleteBudget(user.getUsername(), Category.valueOf(category.toUpperCase()));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public List<BudgetStatusDto> getBudgetStatus(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        LocalDate now = LocalDate.now();
        int m = (month != null) ? month : now.getMonthValue();
        int y = (year != null) ? year : now.getYear();
        return budgetService.getBudgetStatus(user.getUsername(), m, y);
    }
}
