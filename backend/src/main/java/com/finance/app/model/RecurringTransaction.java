package com.finance.app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "recurring_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringTransaction {

    @Id
    private String id;

    private BigDecimal amount;
    private TransactionType type;
    private Category category;
    private String description;
    
    private RecurringFrequency frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextExecutionDate;
    private boolean active;
    
    @org.springframework.data.mongodb.core.index.Indexed
    private String username;
}
