package com.resolveit.helpdesk.ticket.statemachine;

import com.resolveit.helpdesk.common.exception.BusinessRuleException;
import com.resolveit.helpdesk.identity.entity.Role;
import com.resolveit.helpdesk.ticket.entity.Ticket;
import com.resolveit.helpdesk.ticket.entity.TicketStatus;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class TicketStateMachine {

    // Valid state transitions graph
    private static final Map<TicketStatus, Set<TicketStatus>> VALID_TRANSITIONS = Map.of(
            TicketStatus.OPEN, Set.of(TicketStatus.TRIAGED, TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED),
            TicketStatus.TRIAGED, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.PENDING_USER, TicketStatus.CANCELLED),
            TicketStatus.IN_PROGRESS, Set.of(TicketStatus.PENDING_USER, TicketStatus.PENDING_THIRD_PARTY, TicketStatus.RESOLVED, TicketStatus.CANCELLED),
            TicketStatus.PENDING_USER, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED),
            TicketStatus.PENDING_THIRD_PARTY, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED),
            TicketStatus.RESOLVED, Set.of(TicketStatus.CLOSED, TicketStatus.REOPENED),
            TicketStatus.CLOSED, Set.of(TicketStatus.REOPENED),
            TicketStatus.REOPENED, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.TRIAGED, TicketStatus.CANCELLED),
            TicketStatus.CANCELLED, Set.of()
    );

    public void validateTransition(Ticket ticket, TicketStatus targetStatus, Role actorRole, String resolutionSummary) {
        TicketStatus currentStatus = ticket.getStatus();

        if (currentStatus == targetStatus) {
            throw new BusinessRuleException("Ticket is already in status " + currentStatus);
        }

        Set<TicketStatus> permittedTargets = VALID_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!permittedTargets.contains(targetStatus)) {
            throw new BusinessRuleException(String.format(
                    "Invalid state transition: Cannot transition ticket %s from %s to %s",
                    ticket.getTicketNumber(), currentStatus, targetStatus
            ));
        }

        // Role-specific constraints
        if (actorRole == Role.ROLE_EMPLOYEE) {
            if (targetStatus != TicketStatus.CLOSED && targetStatus != TicketStatus.CANCELLED && targetStatus != TicketStatus.REOPENED) {
                throw new BusinessRuleException("Employees may only close, reopen, or cancel their own tickets.");
            }
        }

        // Resolution preconditions
        if (targetStatus == TicketStatus.RESOLVED) {
            if (resolutionSummary == null || resolutionSummary.trim().length() < 10) {
                throw new BusinessRuleException("Resolving a ticket requires a detailed resolution summary of at least 10 characters.");
            }
            if (ticket.getAssignedAgent() == null) {
                throw new BusinessRuleException("Ticket must have an assigned agent before it can be resolved.");
            }
        }

        // Closing preconditions
        if (targetStatus == TicketStatus.CLOSED && currentStatus != TicketStatus.RESOLVED) {
            throw new BusinessRuleException("Only resolved tickets can be transitioned to CLOSED.");
        }
    }
}
