package com.resolveit.helpdesk.asset.repository;

import com.resolveit.helpdesk.asset.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {
    List<Asset> findByOwnerId(UUID ownerId);
}
