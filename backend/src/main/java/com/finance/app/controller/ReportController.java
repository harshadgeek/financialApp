package com.finance.app.controller;

import com.finance.app.dto.DashboardSummaryDto;
import com.finance.app.dto.FutureProjectionDto;
import com.finance.app.dto.MonthlyReportDto;
import com.finance.app.dto.WeeklyReportDto;
import com.finance.app.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public DashboardSummaryDto getDashboard(Principal principal) {
        return reportService.getDashboardSummary(principal.getName());
    }

    @GetMapping("/weekly")
    public WeeklyReportDto getWeeklyReport(Principal principal) {
        return reportService.getWeeklyReport(principal.getName());
    }

    @GetMapping("/monthly")
    public MonthlyReportDto getMonthlyReport(
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year,
            Principal principal) {
        LocalDate now = LocalDate.now();
        int m = month == 0 ? now.getMonthValue() : month;
        int y = year == 0 ? now.getYear() : year;
        return reportService.getMonthlyReport(principal.getName(), m, y);
    }

    @GetMapping("/future-projection")
    public FutureProjectionDto getFutureProjection(
            @RequestParam String targetDate,
            Principal principal) {
        return reportService.getFutureProjection(principal.getName(), LocalDate.parse(targetDate));
    }
}
