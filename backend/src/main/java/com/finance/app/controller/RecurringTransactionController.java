package com.finance.app.controller;

import com.finance.app.model.RecurringTransaction;
import com.finance.app.service.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/recurring-transactions")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    @GetMapping
    public List<RecurringTransaction> getAll(Principal principal) {
        return recurringTransactionService.getAll(principal.getName());
    }

    @PostMapping
    public ResponseEntity<RecurringTransaction> create(@RequestBody RecurringTransaction transaction, Principal principal) {
        transaction.setUsername(principal.getName());
        return ResponseEntity.ok(recurringTransactionService.create(transaction));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransaction> update(@PathVariable String id, @RequestBody RecurringTransaction transaction, Principal principal) {
        return ResponseEntity.ok(recurringTransactionService.update(id, transaction, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Principal principal) {
        recurringTransactionService.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
