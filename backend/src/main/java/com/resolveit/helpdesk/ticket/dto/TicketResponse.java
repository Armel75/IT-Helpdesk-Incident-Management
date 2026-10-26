package com.resolveit.helpdesk.ticket.dto;

import com.resolveit.helpdesk.sla.dto.TicketSlaResponse;
import com.resolveit.helpdesk.ticket.entity.Ticket;
import com.resolveit.helpdesk.ticket.entity.TicketPriority;
import com.resolveit.helpdesk.ticket.entity.TicketSeverity;
import com.resolveit.helpdesk.ticket.entity.TicketStatus;
import com.resolveit.helpdesk.ticket.entity.TicketType;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String ticketNumber,
        String title,
        String description,
        TicketType ticketType,
        TicketPriority priority,
        TicketSeverity severity,
        TicketStatus status,
        UUID requesterId,
        String requesterName,
        String requesterEmail,
        UUID assignedAgentId,
        String assignedAgentName,
        UUID assignedTeamId,
        String assignedTeamName,
        UUID categoryId,
        String categoryName,
        UUID assetId,
        String assetTag,
        String resolutionSummary,
        Instant firstResponseAt,
        Instant resolvedAt,
        Instant closedAt,
        Long version,
        Instant createdAt,
        Instant updatedAt,
        TicketSlaResponse sla
) {
    public static TicketResponse from(Ticket ticket, TicketSlaResponse sla) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getTicketType(),
                ticket.getPriority(),
                ticket.getSeverity(),
                ticket.getStatus(),
                ticket.getRequester().getId(),
                ticket.getRequester().getFullName(),
                ticket.getRequester().getEmail(),
                ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getId() : null,
                ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getFullName() : null,
                ticket.getAssignedTeam() != null ? ticket.getAssignedTeam().getId() : null,
                ticket.getAssignedTeam() != null ? ticket.getAssignedTeam().getName() : null,
                ticket.getCategory().getId(),
                ticket.getCategory().getName(),
                ticket.getAsset() != null ? ticket.getAsset().getId() : null,
                ticket.getAsset() != null ? ticket.getAsset().getAssetTag() : null,
                ticket.getResolutionSummary(),
                ticket.getFirstResponseAt(),
                ticket.getResolvedAt(),
                ticket.getClosedAt(),
                ticket.getVersion(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                sla
        );
    }
}
