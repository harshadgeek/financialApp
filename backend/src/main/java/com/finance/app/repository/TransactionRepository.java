package com.finance.app.repository;

import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByDateBetweenOrderByDateDesc(LocalDate start, LocalDate end);
    List<Transaction> findByTypeAndDateBetween(TransactionType type, LocalDate start, LocalDate end);
    List<Transaction> findAllByOrderByDateDesc();
}
