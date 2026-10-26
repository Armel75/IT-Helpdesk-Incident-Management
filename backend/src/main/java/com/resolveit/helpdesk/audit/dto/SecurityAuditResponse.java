package com.resolveit.helpdesk.audit.dto;

import com.resolveit.helpdesk.audit.entity.SecurityAuditEvent;

import java.time.Instant;
import java.util.UUID;

public record SecurityAuditResponse(
        UUID id,
        UUID userId,
        String action,
        String resourceType,
        String resourceId,
        String ipAddress,
        String status,
        String details,
        Instant createdAt
) {
    public static SecurityAuditResponse from(SecurityAuditEvent event) {
        return new SecurityAuditResponse(
                event.getId(),
                event.getUserId(),
                event.getAction(),
                event.getResourceType(),
                event.getResourceId(),
                event.getIpAddress(),
                event.getStatus(),
                event.getDetails(),
                event.getCreatedAt()
        );
    }
}
