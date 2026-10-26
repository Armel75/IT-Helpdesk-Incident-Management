package com.resolveit.helpdesk.audit.repository;

import com.resolveit.helpdesk.audit.entity.SecurityAuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SecurityAuditEventRepository extends JpaRepository<SecurityAuditEvent, UUID> {
    Page<SecurityAuditEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
