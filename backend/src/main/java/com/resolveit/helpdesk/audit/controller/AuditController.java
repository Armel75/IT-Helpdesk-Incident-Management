package com.resolveit.helpdesk.audit.controller;

import com.resolveit.helpdesk.audit.dto.SecurityAuditResponse;
import com.resolveit.helpdesk.audit.service.AuditService;
import com.resolveit.helpdesk.common.response.PagedResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/logs")
    public ResponseEntity<PagedResponse<SecurityAuditResponse>> getAuditLogs(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.from(auditService.listAuditLogs(pageable)));
    }
}
