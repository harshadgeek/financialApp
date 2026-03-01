package com.finance.app.controller;

import com.finance.app.dto.DashboardSummaryDto;
import com.finance.app.dto.MonthlyReportDto;
import com.finance.app.dto.WeeklyReportDto;
import com.finance.app.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public DashboardSummaryDto getDashboard() {
        return reportService.getDashboardSummary();
    }

    @GetMapping("/weekly")
    public WeeklyReportDto getWeeklyReport() {
        return reportService.getWeeklyReport();
    }

    @GetMapping("/monthly")
    public MonthlyReportDto getMonthlyReport(
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {
        LocalDate now = LocalDate.now();
        int m = month == 0 ? now.getMonthValue() : month;
        int y = year == 0 ? now.getYear() : year;
        return reportService.getMonthlyReport(m, y);
    }
}
