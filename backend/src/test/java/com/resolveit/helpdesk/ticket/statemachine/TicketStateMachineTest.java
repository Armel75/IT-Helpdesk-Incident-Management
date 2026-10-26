package com.resolveit.helpdesk.ticket.statemachine;

import com.resolveit.helpdesk.category.entity.Category;
import com.resolveit.helpdesk.common.exception.BusinessRuleException;
import com.resolveit.helpdesk.identity.entity.Role;
import com.resolveit.helpdesk.identity.entity.User;
import com.resolveit.helpdesk.ticket.entity.Ticket;
import com.resolveit.helpdesk.ticket.entity.TicketPriority;
import com.resolveit.helpdesk.ticket.entity.TicketSeverity;
import com.resolveit.helpdesk.ticket.entity.TicketStatus;
import com.resolveit.helpdesk.ticket.entity.TicketType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TicketStateMachineTest {

    private TicketStateMachine stateMachine;
    private Ticket sampleTicket;
    private User employee;
    private User agent;

    @BeforeEach
    void setUp() {
        stateMachine = new TicketStateMachine();
        employee = new User("employee@resolveit.internal", "hash", "Alex Rivera", Role.ROLE_EMPLOYEE, "Engineering");
        agent = new User("agent@resolveit.internal", "hash", "Marcus Vance", Role.ROLE_IT_AGENT, "IT Operations");
        Category category = new Category("Network", "NET", "Network issues");

        sampleTicket = new Ticket(
                "INC-2026-00001",
                "Cannot access VPN gateway",
                "Details of VPN drop",
                TicketType.INCIDENT,
                TicketPriority.HIGH,
                TicketSeverity.SEV2,
                employee,
                category
        );
    }

    @Test
    @DisplayName("Agent can triage an OPEN ticket to TRIAGED")
    void testValidTransitionToTriaged() {
        assertDoesNotThrow(() -> stateMachine.validateTransition(sampleTicket, TicketStatus.TRIAGED, Role.ROLE_IT_AGENT, null));
    }

    @Test
    @DisplayName("Direct transition from OPEN to RESOLVED is prohibited")
    void testDirectTransitionOpenToResolvedFails() {
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                stateMachine.validateTransition(sampleTicket, TicketStatus.RESOLVED, Role.ROLE_IT_AGENT, "Resolved problem"));
        assertTrue(ex.getMessage().contains("Invalid state transition"));
    }

    @Test
    @DisplayName("Resolving an IN_PROGRESS ticket requires a resolution summary >= 10 chars")
    void testResolveRequiresResolutionSummary() {
        sampleTicket.setStatus(TicketStatus.IN_PROGRESS);
        sampleTicket.setAssignedAgent(agent);

        BusinessRuleException exShort = assertThrows(BusinessRuleException.class, () ->
                stateMachine.validateTransition(sampleTicket, TicketStatus.RESOLVED, Role.ROLE_IT_AGENT, "Short"));
        assertTrue(exShort.getMessage().contains("resolution summary of at least 10 characters"));

        assertDoesNotThrow(() ->
                stateMachine.validateTransition(sampleTicket, TicketStatus.RESOLVED, Role.ROLE_IT_AGENT, "Replaced faulty network cable on router port 2."));
    }

    @Test
    @DisplayName("Employee cannot resolve ticket directly")
    void testEmployeeCannotResolve() {
        sampleTicket.setStatus(TicketStatus.IN_PROGRESS);
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                stateMachine.validateTransition(sampleTicket, TicketStatus.RESOLVED, Role.ROLE_EMPLOYEE, "I fixed it myself"));
        assertTrue(ex.getMessage().contains("Employees may only close, reopen, or cancel"));
    }

    @Test
    @DisplayName("Employee can close a RESOLVED ticket")
    void testEmployeeCanCloseResolvedTicket() {
        sampleTicket.setStatus(TicketStatus.RESOLVED);
        assertDoesNotThrow(() -> stateMachine.validateTransition(sampleTicket, TicketStatus.CLOSED, Role.ROLE_EMPLOYEE, null));
    }
}
