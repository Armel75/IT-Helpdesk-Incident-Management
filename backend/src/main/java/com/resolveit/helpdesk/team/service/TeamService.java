package com.resolveit.helpdesk.team.service;

import com.resolveit.helpdesk.team.dto.TeamResponse;
import com.resolveit.helpdesk.team.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;

    public TeamService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> listActiveTeams() {
        return teamRepository.findByActiveTrue().stream()
                .map(TeamResponse::from)
                .toList();
    }
}
