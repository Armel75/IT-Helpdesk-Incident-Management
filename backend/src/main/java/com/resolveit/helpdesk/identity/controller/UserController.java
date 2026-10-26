package com.resolveit.helpdesk.identity.controller;

import com.resolveit.helpdesk.common.response.PagedResponse;
import com.resolveit.helpdesk.identity.dto.CreateUserRequest;
import com.resolveit.helpdesk.identity.dto.UserResponse;
import com.resolveit.helpdesk.identity.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'IT_MANAGER', 'IT_AGENT')")
    public ResponseEntity<PagedResponse<UserResponse>> listUsers(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.from(userService.listUsers(pageable)));
    }

    @GetMapping("/agents")
    @PreAuthorize("hasAnyRole('ADMIN', 'IT_MANAGER', 'IT_AGENT')")
    public ResponseEntity<List<UserResponse>> listAgents() {
        return ResponseEntity.ok(userService.listAgents());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'IT_MANAGER', 'IT_AGENT') or principal.id == #id")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> activateUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }
}
