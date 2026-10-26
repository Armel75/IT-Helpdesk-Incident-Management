package com.resolveit.helpdesk.dashboard.dto;

import java.util.Map;

public record DashboardStatsResponse(
        long totalOpenTickets,
        long criticalOpenTickets,
        long breachedSlaTickets,
        long resolvedTickets,
        double avgResponseHours,
        double avgResolutionHours,
        Map<String, Long> ticketsByStatus,
        Map<String, Long> ticketsByPriority
) {}
