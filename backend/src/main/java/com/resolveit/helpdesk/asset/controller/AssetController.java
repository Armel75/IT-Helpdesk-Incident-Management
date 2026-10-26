package com.resolveit.helpdesk.asset.controller;

import com.resolveit.helpdesk.asset.dto.AssetResponse;
import com.resolveit.helpdesk.asset.service.AssetService;
import com.resolveit.helpdesk.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'IT_MANAGER', 'IT_AGENT')")
    public ResponseEntity<List<AssetResponse>> listAllAssets() {
        return ResponseEntity.ok(assetService.listAllAssets());
    }

    @GetMapping("/my")
    public ResponseEntity<List<AssetResponse>> listMyAssets(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listUserAssets(principal.getId()));
    }
}
