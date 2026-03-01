package com.finance.app.repository;

import com.finance.app.model.Budget;
import com.finance.app.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByMonthAndYear(int month, int year);
    Optional<Budget> findByCategoryAndMonthAndYear(Category category, int month, int year);
}
