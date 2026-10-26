package com.resolveit.helpdesk.ticket.dto;

import java.util.UUID;

public record AssignTicketRequest(
        UUID agentId,
        UUID teamId,
        Long version
) {}
