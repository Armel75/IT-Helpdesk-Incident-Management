package com.resolveit.helpdesk.history.service;

import com.resolveit.helpdesk.history.dto.TicketHistoryResponse;
import com.resolveit.helpdesk.history.entity.TicketHistory;
import com.resolveit.helpdesk.history.repository.TicketHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TicketHistoryService {

    private final TicketHistoryRepository historyRepository;

    public TicketHistoryService(TicketHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Transactional
    public void recordEvent(UUID ticketId, UUID actorId, String eventType, String fieldChanged, String oldValue, String newValue) {
        TicketHistory history = new TicketHistory(ticketId, actorId, eventType, fieldChanged, oldValue, newValue);
        historyRepository.save(history);
    }

    @Transactional(readOnly = true)
    public List<TicketHistoryResponse> getHistoryForTicket(UUID ticketId) {
        return historyRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(TicketHistoryResponse::from)
                .toList();
    }
}
