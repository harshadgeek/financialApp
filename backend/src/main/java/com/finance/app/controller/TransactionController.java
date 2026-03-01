package com.finance.app.controller;

import com.finance.app.model.Transaction;
import com.finance.app.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public List<Transaction> getAllTransactions(Principal principal) {
        return transactionService.getAllTransactions(principal.getName());
    }

    @PostMapping
    public ResponseEntity<Transaction> addTransaction(@RequestBody Transaction transaction, Principal principal) {
        transaction.setUsername(principal.getName());
        return ResponseEntity.ok(transactionService.addTransaction(transaction));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable String id, @RequestBody Transaction transaction, Principal principal) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, transaction, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable String id, Principal principal) {
        transactionService.deleteTransaction(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
