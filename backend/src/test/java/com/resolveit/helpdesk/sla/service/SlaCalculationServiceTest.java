package com.resolveit.helpdesk.sla.service;

import com.resolveit.helpdesk.sla.entity.SlaPolicy;
import com.resolveit.helpdesk.sla.entity.TicketSla;
import com.resolveit.helpdesk.sla.repository.SlaPolicyRepository;
import com.resolveit.helpdesk.sla.repository.TicketSlaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SlaCalculationServiceTest {

    private SlaPolicyRepository policyRepository;
    private TicketSlaRepository ticketSlaRepository;
    private SlaCalculationService slaService;

    @BeforeEach
    void setUp() {
        policyRepository = mock(SlaPolicyRepository.class);
        ticketSlaRepository = mock(TicketSlaRepository.class);
        slaService = new SlaCalculationService(policyRepository, ticketSlaRepository);
    }

    @Test
    @DisplayName("Calculates correct response and resolution deadlines from SLA policy")
    void testCreateTicketSlaDeadlines() {
        UUID ticketId = UUID.randomUUID();
        SlaPolicy policy = new SlaPolicy("Critical Policy", "CRITICAL", "INCIDENT", 1, 4);
        when(policyRepository.findByPriorityAndTicketTypeAndActiveTrue("CRITICAL", "INCIDENT"))
                .thenReturn(Optional.of(policy));

        when(ticketSlaRepository.save(any(TicketSla.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Instant before = Instant.now();
        TicketSla result = slaService.createTicketSla(ticketId, "CRITICAL", "INCIDENT");
        Instant after = Instant.now();

        assertNotNull(result);
        assertEquals(ticketId, result.getTicketId());
        assertFalse(result.isResponseBreached());
        assertFalse(result.isResolutionBreached());

        // Validate response deadline is ~1 hour in the future
        Duration responseDiff = Duration.between(before, result.getResponseDeadline());
        assertTrue(responseDiff.toMinutes() >= 59 && responseDiff.toMinutes() <= 61);

        // Validate resolution deadline is ~4 hours in the future
        Duration resolutionDiff = Duration.between(before, result.getResolutionDeadline());
        assertTrue(resolutionDiff.toHours() >= 3 && resolutionDiff.toHours() <= 5);
    }

    @Test
    @DisplayName("Flags breach when first response time exceeds response deadline")
    void testRecordFirstResponseBreach() {
        UUID ticketId = UUID.randomUUID();
        SlaPolicy policy = new SlaPolicy("Critical Policy", "CRITICAL", "INCIDENT", 1, 4);
        Instant responseDeadline = Instant.now().minus(Duration.ofMinutes(10));
        Instant resolutionDeadline = Instant.now().plus(Duration.ofHours(3));
        TicketSla existingSla = new TicketSla(ticketId, policy, responseDeadline, resolutionDeadline);

        when(ticketSlaRepository.findByTicketId(ticketId)).thenReturn(Optional.of(existingSla));

        Instant responseTime = Instant.now();
        slaService.recordFirstResponse(ticketId, responseTime);

        assertTrue(existingSla.isResponseBreached());
        assertEquals(responseTime, existingSla.getResponseBreachedAt());
        verify(ticketSlaRepository).save(existingSla);
    }
}
