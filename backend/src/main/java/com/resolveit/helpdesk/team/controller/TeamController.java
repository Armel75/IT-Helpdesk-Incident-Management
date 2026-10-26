package com.resolveit.helpdesk.team.controller;

import com.resolveit.helpdesk.team.dto.TeamResponse;
import com.resolveit.helpdesk.team.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> listTeams() {
        return ResponseEntity.ok(teamService.listActiveTeams());
    }
}
