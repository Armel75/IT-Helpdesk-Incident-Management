package com.resolveit.helpdesk.sla.service;

import com.resolveit.helpdesk.common.exception.ResourceNotFoundException;
import com.resolveit.helpdesk.sla.dto.TicketSlaResponse;
import com.resolveit.helpdesk.sla.entity.SlaPolicy;
import com.resolveit.helpdesk.sla.entity.TicketSla;
import com.resolveit.helpdesk.sla.repository.SlaPolicyRepository;
import com.resolveit.helpdesk.sla.repository.TicketSlaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class SlaCalculationService {

    private final SlaPolicyRepository policyRepository;
    private final TicketSlaRepository ticketSlaRepository;

    public SlaCalculationService(SlaPolicyRepository policyRepository, TicketSlaRepository ticketSlaRepository) {
        this.policyRepository = policyRepository;
        this.ticketSlaRepository = ticketSlaRepository;
    }

    @Transactional
    public TicketSla createTicketSla(UUID ticketId, String priority, String ticketType) {
        SlaPolicy policy = policyRepository.findByPriorityAndTicketTypeAndActiveTrue(priority, ticketType)
                .orElseGet(() -> policyRepository.findByPriorityAndTicketTypeAndActiveTrue("MEDIUM", "INCIDENT")
                        .orElseThrow(() -> new ResourceNotFoundException("Default SLA policy not configured")));

        Instant now = Instant.now();
        Instant responseDeadline = now.plus(Duration.ofHours(policy.getResponseTimeHours()));
        Instant resolutionDeadline = now.plus(Duration.ofHours(policy.getResolutionTimeHours()));

        TicketSla sla = new TicketSla(ticketId, policy, responseDeadline, resolutionDeadline);
        return ticketSlaRepository.save(sla);
    }

    @Transactional(readOnly = true)
    public Optional<TicketSlaResponse> getTicketSla(UUID ticketId) {
        return ticketSlaRepository.findByTicketId(ticketId).map(TicketSlaResponse::from);
    }

    @Transactional
    public void recordFirstResponse(UUID ticketId, Instant responseTime) {
        ticketSlaRepository.findByTicketId(ticketId).ifPresent(sla -> {
            if (!sla.isResponseBreached() && responseTime.isAfter(sla.getResponseDeadline())) {
                sla.setResponseBreached(true);
                sla.setResponseBreachedAt(responseTime);
                ticketSlaRepository.save(sla);
            }
        });
    }

    @Transactional
    public void recordResolution(UUID ticketId, Instant resolutionTime) {
        ticketSlaRepository.findByTicketId(ticketId).ifPresent(sla -> {
            if (!sla.isResolutionBreached() && resolutionTime.isAfter(sla.getResolutionDeadline())) {
                sla.setResolutionBreached(true);
                sla.setResolutionBreachedAt(resolutionTime);
                ticketSlaRepository.save(sla);
            }
        });
    }
}
