package com.resolveit.helpdesk.sla.repository;

import com.resolveit.helpdesk.sla.entity.SlaPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, UUID> {
    Optional<SlaPolicy> findByPriorityAndTicketTypeAndActiveTrue(String priority, String ticketType);
}
