package com.finance.app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.springframework.data.annotation.CreatedDate;

@Document(collection = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    private String id;

    private BigDecimal amount;
    private TransactionType type;
    private Category category;
    private String description;
    private LocalDate date;
    
    @CreatedDate
    private Instant createdAt;
    
    @org.springframework.data.mongodb.core.index.Indexed
    private String username; // The user this transaction belongs to
}
