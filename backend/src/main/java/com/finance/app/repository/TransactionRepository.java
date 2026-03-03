package com.finance.app.repository;

import com.finance.app.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findAllByUsernameOrderByDateDescCreatedAtDesc(String username);
    @org.springframework.data.mongodb.repository.Query("{ 'username': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<Transaction> findByUsernameAndDateGreaterThanEqualAndDateLessThanEqualOrderByDateDescCreatedAtDesc(String username, LocalDate startDate, LocalDate endDate);
}
