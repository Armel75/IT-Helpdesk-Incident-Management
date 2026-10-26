package com.resolveit.helpdesk.identity.dto;

import com.resolveit.helpdesk.identity.entity.Role;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInMs,
        UUID userId,
        String email,
        String fullName,
        Role role,
        String department
) {
    public static AuthResponse of(String accessToken, long expiresInMs, UUID userId, String email, String fullName, Role role, String department) {
        return new AuthResponse(accessToken, "Bearer", expiresInMs, userId, email, fullName, role, department);
    }
}
