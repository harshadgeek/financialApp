package com.finance.app.controller;

import com.finance.app.dto.DashboardSummaryDto;
import com.finance.app.dto.WeeklyReportDto;
import com.finance.app.security.JwtFilter;
import com.finance.app.security.JwtUtil;
import com.finance.app.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser(username = "testuser")
    void getDashboard_ReturnsSummary() throws Exception {
        when(reportService.getDashboardSummary("testuser")).thenReturn(null);

        mockMvc.perform(get("/api/reports/dashboard"))
                .andExpect(status().isOk());

        verify(reportService).getDashboardSummary("testuser");
    }

    @Test
    @WithMockUser(username = "testuser")
    void getWeeklyReport_ReturnsReport() throws Exception {
        when(reportService.getWeeklyReport("testuser")).thenReturn(null);

        mockMvc.perform(get("/api/reports/weekly"))
                .andExpect(status().isOk());

        verify(reportService).getWeeklyReport("testuser");
    }
}
