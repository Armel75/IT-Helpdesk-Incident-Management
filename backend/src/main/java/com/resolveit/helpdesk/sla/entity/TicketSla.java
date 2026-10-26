package com.resolveit.helpdesk.sla.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ticket_sla")
public class TicketSla {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "ticket_id", nullable = false, unique = true)
    private UUID ticketId;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "policy_id", nullable = false)
    private SlaPolicy policy;

    @Column(name = "response_deadline", nullable = false)
    private Instant responseDeadline;

    @Column(name = "resolution_deadline", nullable = false)
    private Instant resolutionDeadline;

    @Column(name = "response_breached", nullable = false)
    private boolean responseBreached = false;

    @Column(name = "resolution_breached", nullable = false)
    private boolean resolutionBreached = false;

    @Column(name = "response_breached_at")
    private Instant responseBreachedAt;

    @Column(name = "resolution_breached_at")
    private Instant resolutionBreachedAt;

    @Version
    private Long version = 0L;

    public TicketSla() {}

    public TicketSla(UUID ticketId, SlaPolicy policy, Instant responseDeadline, Instant resolutionDeadline) {
        this.ticketId = ticketId;
        this.policy = policy;
        this.responseDeadline = responseDeadline;
        this.resolutionDeadline = resolutionDeadline;
        this.responseBreached = false;
        this.resolutionBreached = false;
    }

    public UUID getId() { return id; }
    public UUID getTicketId() { return ticketId; }
    public SlaPolicy getPolicy() { return policy; }
    public Instant getResponseDeadline() { return responseDeadline; }
    public Instant getResolutionDeadline() { return resolutionDeadline; }
    public boolean isResponseBreached() { return responseBreached; }
    public void setResponseBreached(boolean responseBreached) { this.responseBreached = responseBreached; }
    public boolean isResolutionBreached() { return resolutionBreached; }
    public void setResolutionBreached(boolean resolutionBreached) { this.resolutionBreached = resolutionBreached; }
    public Instant getResponseBreachedAt() { return responseBreachedAt; }
    public void setResponseBreachedAt(Instant responseBreachedAt) { this.responseBreachedAt = responseBreachedAt; }
    public Instant getResolutionBreachedAt() { return resolutionBreachedAt; }
    public void setResolutionBreachedAt(Instant resolutionBreachedAt) { this.resolutionBreachedAt = resolutionBreachedAt; }
    public Long getVersion() { return version; }
}
