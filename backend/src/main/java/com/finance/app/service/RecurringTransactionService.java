package com.finance.app.service;

import com.finance.app.model.RecurringFrequency;
import com.finance.app.model.RecurringTransaction;
import com.finance.app.model.Transaction;
import com.finance.app.repository.RecurringTransactionRepository;
import com.finance.app.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;

    public List<RecurringTransaction> getAll(String username) {
        return recurringTransactionRepository.findAllByUsername(username);
    }

    public RecurringTransaction create(RecurringTransaction req) {
        if (req.getStartDate() == null) {
            req.setStartDate(LocalDate.now());
        }
        if (req.getNextExecutionDate() == null) {
            req.setNextExecutionDate(req.getStartDate());
        }
        return recurringTransactionRepository.save(req);
    }

    public RecurringTransaction update(String id, RecurringTransaction req, String username) {
        RecurringTransaction existing = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        if (!existing.getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }
        
        // Merge fields
        existing.setAmount(req.getAmount());
        existing.setCategory(req.getCategory());
        existing.setDescription(req.getDescription());
        existing.setType(req.getType());
        existing.setFrequency(req.getFrequency());
        existing.setStartDate(req.getStartDate());
        existing.setEndDate(req.getEndDate());
        existing.setActive(req.isActive());
        
        // If start date changed, we might need to recalculate nextExecutionDate
        if (req.getNextExecutionDate() != null) {
            existing.setNextExecutionDate(req.getNextExecutionDate());
        } else if (existing.getStartDate() == null || !existing.getStartDate().equals(req.getStartDate())) {
            existing.setNextExecutionDate(req.getStartDate());
        }

        return recurringTransactionRepository.save(existing);
    }

    public void delete(String id, String username) {
        RecurringTransaction tx = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        if (!tx.getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }
        recurringTransactionRepository.deleteById(id);
    }

    /**
     * Runs every day at 00:01 (1 AM).
     * Checks for active recurring transactions where nextExecutionDate is <= today.
     */
    @Scheduled(cron = "0 1 0 * * ?")
    @Transactional
    public void processRecurringTransactions() {
        LocalDate today = LocalDate.now();
        log.info("Running automatic transaction generator for date: {}", today);

        List<RecurringTransaction> dueTransactions = recurringTransactionRepository
                .findByActiveTrueAndNextExecutionDateLessThanEqual(today);

        int count = 0;
        for (RecurringTransaction rt : dueTransactions) {
            try {
                // Generate the actual transaction
                Transaction t = Transaction.builder()
                        .amount(rt.getAmount())
                        .type(rt.getType())
                        .category(rt.getCategory())
                        .description(rt.getDescription() + " (Auto)")
                        .date(today)
                        .username(rt.getUsername())
                        .build();

                transactionRepository.save(t);

                // Update next execution date based on frequency
                LocalDate nextDate = computeNextDate(rt.getNextExecutionDate(), rt.getFrequency());
                
                // If it passes endDate, deactivate it
                if (rt.getEndDate() != null && nextDate.isAfter(rt.getEndDate())) {
                    rt.setActive(false);
                    rt.setNextExecutionDate(null);
                } else {
                    rt.setNextExecutionDate(nextDate);
                }
                
                recurringTransactionRepository.save(rt);

                count++;
            } catch (Exception e) {
                log.error("Failed to process recurring transaction ID {}: {}", rt.getId(), e.getMessage());
            }
        }
        
        log.info("Finished running recurring transactions. Processed {} transactions.", count);
    }

    private LocalDate computeNextDate(LocalDate from, RecurringFrequency freq) {
        return switch (freq) {
            case DAILY -> from.plusDays(1);
            case WEEKLY -> from.plusWeeks(1);
            case MONTHLY -> from.plusMonths(1);
            case YEARLY -> from.plusYears(1);
        };
    }
}
