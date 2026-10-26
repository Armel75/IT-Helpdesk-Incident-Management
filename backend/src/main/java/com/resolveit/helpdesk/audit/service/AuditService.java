package com.resolveit.helpdesk.audit.service;

import com.resolveit.helpdesk.audit.dto.SecurityAuditResponse;
import com.resolveit.helpdesk.audit.entity.SecurityAuditEvent;
import com.resolveit.helpdesk.audit.repository.SecurityAuditEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditService {

    private final SecurityAuditEventRepository auditRepository;

    public AuditService(SecurityAuditEventRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    @Transactional
    public void recordSecurityEvent(UUID userId, String action, String resourceType, String resourceId, String ipAddress, String status, String details) {
        SecurityAuditEvent event = new SecurityAuditEvent(userId, action, resourceType, resourceId, ipAddress, status, details);
        auditRepository.save(event);
    }

    @Transactional(readOnly = true)
    public Page<SecurityAuditResponse> listAuditLogs(Pageable pageable) {
        return auditRepository.findAllByOrderByCreatedAtDesc(pageable).map(SecurityAuditResponse::from);
    }
}
