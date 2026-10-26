package com.resolveit.helpdesk.asset.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "asset_tag", nullable = false, unique = true, length = 50)
    private String assetTag;

    @Column(nullable = false)
    private String name;

    @Column(name = "asset_type", nullable = false, length = 50)
    private String assetType;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Asset() {}

    public Asset(String assetTag, String name, String assetType, String status, UUID ownerId, String serialNumber) {
        this.assetTag = assetTag;
        this.name = name;
        this.assetType = assetType;
        this.status = status;
        this.ownerId = ownerId;
        this.serialNumber = serialNumber;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getAssetTag() { return assetTag; }
    public String getName() { return name; }
    public String getAssetType() { return assetType; }
    public String getStatus() { return status; }
    public UUID getOwnerId() { return ownerId; }
    public String getSerialNumber() { return serialNumber; }
    public Instant getCreatedAt() { return createdAt; }
}
