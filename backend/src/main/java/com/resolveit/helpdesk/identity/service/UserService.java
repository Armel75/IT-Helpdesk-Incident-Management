package com.resolveit.helpdesk.identity.service;

import com.resolveit.helpdesk.common.exception.ConflictException;
import com.resolveit.helpdesk.common.exception.ResourceNotFoundException;
import com.resolveit.helpdesk.identity.dto.CreateUserRequest;
import com.resolveit.helpdesk.identity.dto.UserResponse;
import com.resolveit.helpdesk.identity.entity.Role;
import com.resolveit.helpdesk.identity.entity.User;
import com.resolveit.helpdesk.identity.repository.RefreshTokenRepository;
import com.resolveit.helpdesk.identity.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAgents() {
        return userRepository.findByRoleInAndActiveTrue(List.of(Role.ROLE_IT_AGENT, Role.ROLE_IT_MANAGER))
                .stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email().toLowerCase().trim())) {
            throw new ConflictException("Email is already registered: " + request.email());
        }

        User user = new User(
                request.email().toLowerCase().trim(),
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                request.role(),
                request.department().trim()
        );

        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse deactivateUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setActive(false);
        userRepository.save(user);

        // Security rule: revoke all existing sessions immediately
        refreshTokenRepository.revokeAllUserTokens(user);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse activateUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setActive(true);
        userRepository.save(user);
        return UserResponse.from(user);
    }
}
