package com.resolveit.helpdesk.sla.repository;

import com.resolveit.helpdesk.sla.entity.TicketSla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketSlaRepository extends JpaRepository<TicketSla, UUID> {
    Optional<TicketSla> findByTicketId(UUID ticketId);

    @Query("SELECT s FROM TicketSla s WHERE s.resolutionDeadline < :now AND s.resolutionBreached = false")
    List<TicketSla> findOverdueUnbreachedResolutions(Instant now);

    @Query("SELECT s FROM TicketSla s WHERE s.responseDeadline < :now AND s.responseBreached = false")
    List<TicketSla> findOverdueUnbreachedResponses(Instant now);

    @Query("SELECT COUNT(s) FROM TicketSla s WHERE s.resolutionBreached = true OR s.responseBreached = true")
    long countTotalBreachedSlas();
}
