package com.resolveit.helpdesk.asset.service;

import com.resolveit.helpdesk.asset.dto.AssetResponse;
import com.resolveit.helpdesk.asset.repository.AssetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AssetService {

    private final AssetRepository assetRepository;

    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> listAllAssets() {
        return assetRepository.findAll().stream().map(AssetResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> listUserAssets(UUID userId) {
        return assetRepository.findByOwnerId(userId).stream().map(AssetResponse::from).toList();
    }
}
