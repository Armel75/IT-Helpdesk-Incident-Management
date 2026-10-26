package com.resolveit.helpdesk.ticket.controller;

import com.resolveit.helpdesk.common.response.PagedResponse;
import com.resolveit.helpdesk.security.UserPrincipal;
import com.resolveit.helpdesk.ticket.dto.AssignTicketRequest;
import com.resolveit.helpdesk.ticket.dto.CreateTicketRequest;
import com.resolveit.helpdesk.ticket.dto.TicketResponse;
import com.resolveit.helpdesk.ticket.dto.TransitionTicketRequest;
import com.resolveit.helpdesk.ticket.entity.TicketPriority;
import com.resolveit.helpdesk.ticket.entity.TicketStatus;
import com.resolveit.helpdesk.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<TicketResponse>> listTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID agentId,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(PagedResponse.from(ticketService.listTickets(
                status, priority, categoryId, agentId, search, currentUser, pageable
        )));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(ticketService.getTicketById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request, currentUser));
    }

    @PostMapping("/{id}/transition")
    public ResponseEntity<TicketResponse> transitionTicket(
            @PathVariable UUID id,
            @Valid @RequestBody TransitionTicketRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(ticketService.transitionTicket(id, request, currentUser));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'IT_MANAGER', 'IT_AGENT')")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable UUID id,
            @RequestBody AssignTicketRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request, currentUser));
    }
}
