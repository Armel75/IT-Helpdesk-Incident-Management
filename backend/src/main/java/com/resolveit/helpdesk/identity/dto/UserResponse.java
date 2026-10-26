package com.resolveit.helpdesk.identity.dto;

import com.resolveit.helpdesk.identity.entity.Role;
import com.resolveit.helpdesk.identity.entity.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        String department,
        boolean active,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getDepartment(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
