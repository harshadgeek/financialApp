package com.finance.app.repository;

import com.finance.app.model.Budget;
import com.finance.app.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends MongoRepository<Budget, String> {
    List<Budget> findByUsernameAndMonthAndYear(String username, int month, int year);
    Optional<Budget> findByUsernameAndCategoryAndMonthAndYear(String username, Category category, int month, int year);
}
