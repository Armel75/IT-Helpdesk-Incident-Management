package com.resolveit.helpdesk.team.dto;

import com.resolveit.helpdesk.team.entity.Team;

import java.util.UUID;

public record TeamResponse(
        UUID id,
        String name,
        String description,
        UUID leadUserId,
        boolean active
) {
    public static TeamResponse from(Team team) {
        return new TeamResponse(team.getId(), team.getName(), team.getDescription(), team.getLeadUserId(), team.isActive());
    }
}
