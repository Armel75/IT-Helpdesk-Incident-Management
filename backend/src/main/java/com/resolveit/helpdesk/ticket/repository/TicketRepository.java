package com.resolveit.helpdesk.ticket.repository;

import com.resolveit.helpdesk.ticket.entity.Ticket;
import com.resolveit.helpdesk.ticket.entity.TicketPriority;
import com.resolveit.helpdesk.ticket.entity.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    Page<Ticket> findByRequesterId(UUID requesterId, Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:priority IS NULL OR t.priority = :priority) AND " +
            "(:requesterId IS NULL OR t.requester.id = :requesterId) AND " +
            "(:agentId IS NULL OR t.assignedAgent.id = :agentId) AND " +
            "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
            "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.ticketNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> findWithFilters(
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("requesterId") UUID requesterId,
            @Param("agentId") UUID agentId,
            @Param("categoryId") UUID categoryId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')")
    long countOpenTickets();

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.priority = :priority AND t.status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')")
    long countOpenByPriority(@Param("priority") TicketPriority priority);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = :status")
    long countByStatus(@Param("status") TicketStatus status);

    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> getStatusCounts();

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t WHERE t.status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED') GROUP BY t.priority")
    List<Object[]> getPriorityCounts();
}
