package com.resolveit.helpdesk.asset.dto;

import com.resolveit.helpdesk.asset.entity.Asset;

import java.util.UUID;

public record AssetResponse(
        UUID id,
        String assetTag,
        String name,
        String assetType,
        String status,
        UUID ownerId,
        String serialNumber
) {
    public static AssetResponse from(Asset asset) {
        return new AssetResponse(
                asset.getId(),
                asset.getAssetTag(),
                asset.getName(),
                asset.getAssetType(),
                asset.getStatus(),
                asset.getOwnerId(),
                asset.getSerialNumber()
        );
    }
}
