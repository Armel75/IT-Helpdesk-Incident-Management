package com.resolveit.helpdesk.sla.dto;

import com.resolveit.helpdesk.sla.entity.TicketSla;

import java.time.Instant;
import java.util.UUID;

public record TicketSlaResponse(
        UUID id,
        UUID ticketId,
        String policyName,
        Instant responseDeadline,
        Instant resolutionDeadline,
        boolean responseBreached,
        boolean resolutionBreached,
        Instant responseBreachedAt,
        Instant resolutionBreachedAt
) {
    public static TicketSlaResponse from(TicketSla sla) {
        return new TicketSlaResponse(
                sla.getId(),
                sla.getTicketId(),
                sla.getPolicy().getName(),
                sla.getResponseDeadline(),
                sla.getResolutionDeadline(),
                sla.isResponseBreached(),
                sla.isResolutionBreached(),
                sla.getResponseBreachedAt(),
                sla.getResolutionBreachedAt()
        );
    }
}
