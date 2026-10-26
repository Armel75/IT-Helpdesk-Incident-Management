package com.resolveit.helpdesk.sla.scheduler;

import com.resolveit.helpdesk.sla.entity.TicketSla;
import com.resolveit.helpdesk.sla.repository.TicketSlaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class SlaScheduler {

    private static final Logger log = LoggerFactory.getLogger(SlaScheduler.class);
    private final TicketSlaRepository slaRepository;

    public SlaScheduler(TicketSlaRepository slaRepository) {
        this.slaRepository = slaRepository;
    }

    @Scheduled(fixedDelayString = "${app.sla.check-interval-ms:60000}")
    @Transactional
    public void scanAndFlagBreachedSlas() {
        Instant now = Instant.now();

        // 1. Resolution deadlines
        List<TicketSla> overdueResolutions = slaRepository.findOverdueUnbreachedResolutions(now);
        for (TicketSla sla : overdueResolutions) {
            sla.setResolutionBreached(true);
            sla.setResolutionBreachedAt(now);
            slaRepository.save(sla);
            log.warn("SLA RESOLUTION BREACH detected for ticket {}! Deadline was: {}", sla.getTicketId(), sla.getResolutionDeadline());
        }

        // 2. Response deadlines
        List<TicketSla> overdueResponses = slaRepository.findOverdueUnbreachedResponses(now);
        for (TicketSla sla : overdueResponses) {
            sla.setResponseBreached(true);
            sla.setResponseBreachedAt(now);
            slaRepository.save(sla);
            log.warn("SLA RESPONSE BREACH detected for ticket {}! Deadline was: {}", sla.getTicketId(), sla.getResponseDeadline());
        }
    }
}
