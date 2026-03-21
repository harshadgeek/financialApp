package com.finance.app.service;

import com.finance.app.model.Category;
import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.model.User;
import com.finance.app.repository.TransactionRepository;
import com.finance.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DataSeederService implements CommandLineRunner {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .username("demo")
                    .email("demo@financeiq.com")
                    .password(passwordEncoder.encode("demo123"))
                    .build());
        }

        if (transactionRepository.count() > 0) return;

        seedTransactions();
    }



    private void seedTransactions() {
        LocalDate today = LocalDate.now();
        SecureRandom rnd = new SecureRandom();

        // Seed 6 months of data
        for (int monthsBack = 5; monthsBack >= 0; monthsBack--) {
            LocalDate monthStart = today.withDayOfMonth(1).minusMonths(monthsBack);
            int daysInMonth = monthStart.lengthOfMonth();
            int targetDay = monthsBack == 0 ? today.getDayOfMonth() : daysInMonth;

            // Monthly salary
            transactionRepository.save(Transaction.builder()
                    .amount(new BigDecimal("55000.00"))
                    .type(TransactionType.INCOME)
                    .category(Category.SALARY)
                    .description("Monthly Salary")
                    .date(monthStart.withDayOfMonth(1))
                    .username("demo")
                    .build());

            // Occasional freelance
            if (rnd.nextBoolean()) {
                transactionRepository.save(Transaction.builder()
                        .amount(BigDecimal.valueOf(3000 + rnd.nextInt(7000)))
                        .type(TransactionType.INCOME)
                        .category(Category.OTHER)
                        .description("Freelance Income")
                        .date(monthStart.withDayOfMonth(Math.min(15, targetDay)))
                        .username("demo")
                        .build());
            }

            // Weekly expenses
            int[][] expenseTemplates = {
                    {5, 1200, 2500},
                    {3, 300, 800},
                    {7, 2000, 5000},
                    {2, 500, 1500},
                    {10, 800, 2000}
            };
            Category[] expenseCategories = {Category.FOOD, Category.TRANSPORT, Category.UTILITIES, Category.HEALTH, Category.ENTERTAINMENT};
            String[] descs = {"Grocery Shopping", "Fuel & Commute", "Electricity & Internet", "Pharmacy", "Netflix & Dining"};

            for (int i = 0; i < expenseTemplates.length; i++) {
                for (int week = 0; week < 4; week++) {
                    int day = Math.min(expenseTemplates[i][0] + week * 7, targetDay);
                    if (day > targetDay) continue;
                    transactionRepository.save(Transaction.builder()
                            .amount(BigDecimal.valueOf(expenseTemplates[i][1] + rnd.nextInt(expenseTemplates[i][2] - expenseTemplates[i][1])))
                            .type(TransactionType.EXPENSE)
                            .category(expenseCategories[i])
                            .description(descs[i])
                            .date(monthStart.withDayOfMonth(day))
                            .username("demo")
                            .build());
                }
            }

            // Random shopping
            for (int i = 0; i < 3; i++) {
                int day = 1 + rnd.nextInt(targetDay);
                transactionRepository.save(Transaction.builder()
                        .amount(BigDecimal.valueOf(500 + rnd.nextInt(4000)))
                        .type(TransactionType.EXPENSE)
                        .category(Category.SHOPPING)
                        .description(List.of("Amazon Purchase", "Clothing Store", "Electronics", "Home Decor").get(rnd.nextInt(4)))
                        .date(monthStart.withDayOfMonth(day))
                        .username("demo")
                        .build());
            }
        }
    }
}
