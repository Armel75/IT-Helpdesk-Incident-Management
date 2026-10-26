package com.resolveit.helpdesk.dashboard.controller;

import com.resolveit.helpdesk.dashboard.dto.DashboardStatsResponse;
import com.resolveit.helpdesk.dashboard.service.DashboardService;
import com.resolveit.helpdesk.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardStatsResponse> getSummary(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getStats(currentUser));
    }
}
