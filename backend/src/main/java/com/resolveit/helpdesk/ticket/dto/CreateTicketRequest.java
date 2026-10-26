package com.resolveit.helpdesk.ticket.dto;

import com.resolveit.helpdesk.ticket.entity.TicketPriority;
import com.resolveit.helpdesk.ticket.entity.TicketSeverity;
import com.resolveit.helpdesk.ticket.entity.TicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateTicketRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(min = 10, message = "Description must be at least 10 characters")
        String description,

        @NotNull(message = "Ticket type is required")
        TicketType ticketType,

        @NotNull(message = "Priority is required")
        TicketPriority priority,

        TicketSeverity severity,

        @NotNull(message = "Category is required")
        UUID categoryId,

        UUID assetId
) {}
