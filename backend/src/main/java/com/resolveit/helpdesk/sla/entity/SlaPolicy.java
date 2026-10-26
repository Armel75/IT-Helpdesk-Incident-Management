package com.resolveit.helpdesk.sla.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sla_policies")
public class SlaPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String priority;

    @Column(name = "ticket_type", nullable = false, length = 50)
    private String ticketType;

    @Column(name = "response_time_hours", nullable = false)
    private int responseTimeHours;

    @Column(name = "resolution_time_hours", nullable = false)
    private int resolutionTimeHours;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public SlaPolicy() {}

    public SlaPolicy(String name, String priority, String ticketType, int responseTimeHours, int resolutionTimeHours) {
        this.name = name;
        this.priority = priority;
        this.ticketType = ticketType;
        this.responseTimeHours = responseTimeHours;
        this.resolutionTimeHours = resolutionTimeHours;
        this.active = true;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getPriority() { return priority; }
    public String getTicketType() { return ticketType; }
    public int getResponseTimeHours() { return responseTimeHours; }
    public int getResolutionTimeHours() { return resolutionTimeHours; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
}
