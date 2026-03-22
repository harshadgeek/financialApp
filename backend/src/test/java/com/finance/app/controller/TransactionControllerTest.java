package com.finance.app.controller;

import com.finance.app.model.Transaction;
import com.finance.app.security.JwtUtil;
import com.finance.app.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser(username = "testuser")
    void getAllTransactions_ReturnsList() throws Exception {
        when(transactionService.getAllTransactions("testuser")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(transactionService).getAllTransactions("testuser");
    }

    @Test
    @WithMockUser(username = "testuser")
    void addTransaction_ReturnsSaved() throws Exception {
        Transaction tx = Transaction.builder().amount(new BigDecimal("100")).build();
        when(transactionService.addTransaction(any(Transaction.class))).thenReturn(tx);

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"amount\":100, \"category\":\"FOOD\"}"))
                .andExpect(status().isOk());

        verify(transactionService).addTransaction(any(Transaction.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void deleteTransaction_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/transactions/123"))
                .andExpect(status().isNoContent());

        verify(transactionService).deleteTransaction("123", "testuser");
    }
}
