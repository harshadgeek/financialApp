package com.finance.app.service;

import com.finance.app.model.Transaction;
import com.finance.app.model.TransactionType;
import com.finance.app.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactions(String username) {
        return transactionRepository.findAllByUsernameOrderByDateDesc(username);
    }

    public Transaction addTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(String id, String username) {
        Transaction tx = getById(id);
        if (!tx.getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }
        transactionRepository.deleteById(id);
    }

    public Transaction getById(String id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + id));
    }
}
