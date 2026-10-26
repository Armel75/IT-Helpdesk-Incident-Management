package com.resolveit.helpdesk.history.dto;

import com.resolveit.helpdesk.history.entity.TicketHistory;

import java.time.Instant;
import java.util.UUID;

public record TicketHistoryResponse(
        UUID id,
        UUID ticketId,
        UUID actorId,
        String eventType,
        String fieldChanged,
        String oldValue,
        String newValue,
        Instant createdAt
) {
    public static TicketHistoryResponse from(TicketHistory history) {
        return new TicketHistoryResponse(
                history.getId(),
                history.getTicketId(),
                history.getActorId(),
                history.getEventType(),
                history.getFieldChanged(),
                history.getOldValue(),
                history.getNewValue(),
                history.getCreatedAt()
        );
    }
}
