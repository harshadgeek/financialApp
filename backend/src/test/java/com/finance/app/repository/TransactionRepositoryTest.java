package com.finance.app.repository;

import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest
class TransactionRepositoryTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Test
    void findAllByUsernameOrderByDateDescCreatedAtDesc_ReturnsTransactions() {
        Transaction t = new Transaction();
        t.setUsername("testuser");
        t.setAmount(new BigDecimal("100.0"));
        t.setType(TransactionType.EXPENSE);
        t.setDate(LocalDate.now());
        transactionRepository.save(t);

        List<Transaction> found = transactionRepository.findAllByUsernameOrderByDateDescCreatedAtDesc("testuser");
        assertFalse(found.isEmpty());
        assertEquals(new BigDecimal("100.0"), found.getFirst().getAmount());

        transactionRepository.delete(t);
    }
}
