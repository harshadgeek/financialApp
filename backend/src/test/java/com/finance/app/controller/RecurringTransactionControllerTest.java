package com.finance.app.controller;

import com.finance.app.model.RecurringTransaction;
import com.finance.app.security.JwtUtil;
import com.finance.app.service.RecurringTransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RecurringTransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RecurringTransactionService recurringTransactionService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser(username = "testuser")
    void getAll_ReturnsList() throws Exception {
        when(recurringTransactionService.getAll("testuser")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/recurring-transactions"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(recurringTransactionService).getAll("testuser");
    }

    @Test
    @WithMockUser(username = "testuser")
    void create_ReturnsSaved() throws Exception {
        RecurringTransaction rt = new RecurringTransaction();
        when(recurringTransactionService.create(any(RecurringTransaction.class))).thenReturn(rt);

        mockMvc.perform(post("/api/recurring-transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"amount\":100, \"description\":\"test\"}"))
                .andExpect(status().isOk());

        verify(recurringTransactionService).create(any(RecurringTransaction.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void delete_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/recurring-transactions/123"))
                .andExpect(status().isNoContent());

        verify(recurringTransactionService).delete("123", "testuser");
    }
}
