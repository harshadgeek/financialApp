package com.finance.app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.math.BigDecimal;

@Document(collection = "budgets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "user_category_idx", def = "{'username': 1, 'category': 1}", unique = true)
public class Budget {

    @Id
    private String id;

    private String username;
    private Category category;
    private BigDecimal monthlyLimit;
}
