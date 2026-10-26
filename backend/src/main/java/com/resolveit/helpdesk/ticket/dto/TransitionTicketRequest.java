package com.resolveit.helpdesk.ticket.dto;

import com.resolveit.helpdesk.ticket.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record TransitionTicketRequest(
        @NotNull(message = "Target status is required")
        TicketStatus targetStatus,

        String resolutionSummary,

        @NotNull(message = "Entity version is required for optimistic locking")
        Long version
) {}
