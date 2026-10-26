package com.resolveit.helpdesk.team.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "lead_user_id")
    private UUID leadUserId;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Team() {}

    public Team(String name, String description, UUID leadUserId) {
        this.name = name;
        this.description = description;
        this.leadUserId = leadUserId;
        this.active = true;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public UUID getLeadUserId() { return leadUserId; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
}
