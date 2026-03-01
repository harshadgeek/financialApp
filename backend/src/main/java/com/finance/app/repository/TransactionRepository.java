package com.finance.app.repository;

import com.finance.app.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findAllByUsernameOrderByDateDesc(String username);
    List<Transaction> findByUsernameAndDateBetweenOrderByDateDesc(String username, LocalDate startDate, LocalDate endDate);
}
