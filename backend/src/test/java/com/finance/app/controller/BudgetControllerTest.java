package com.finance.app.controller;

import com.finance.app.model.Budget;
import com.finance.app.model.Category;
import com.finance.app.security.JwtUtil;
import com.finance.app.service.BudgetService;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BudgetService budgetService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser(username = "testuser")
    void getBudgets_ReturnsList() throws Exception {
        when(budgetService.getBudgets("testuser")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/budgets"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(budgetService).getBudgets("testuser");
    }

    @Test
    @WithMockUser(username = "testuser")
    void upsertBudget_ReturnsSaved() throws Exception {
        Budget budget = Budget.builder().category(Category.FOOD).monthlyLimit(new BigDecimal("500")).build();
        when(budgetService.upsertBudget(eq("testuser"), eq(Category.FOOD), any(BigDecimal.class))).thenReturn(budget);

        mockMvc.perform(post("/api/budgets")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"category\":\"FOOD\", \"monthlyLimit\":500}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("FOOD"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void deleteBudget_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/budgets/FOOD"))
                .andExpect(status().isNoContent());

        verify(budgetService).deleteBudget("testuser", Category.FOOD);
    }
}
