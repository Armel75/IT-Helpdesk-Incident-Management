package com.resolveit.helpdesk.history.controller;

import com.resolveit.helpdesk.history.dto.TicketHistoryResponse;
import com.resolveit.helpdesk.history.service.TicketHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/history")
public class TicketHistoryController {

    private final TicketHistoryService historyService;

    public TicketHistoryController(TicketHistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<List<TicketHistoryResponse>> getTicketHistory(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(historyService.getHistoryForTicket(ticketId));
    }
}
