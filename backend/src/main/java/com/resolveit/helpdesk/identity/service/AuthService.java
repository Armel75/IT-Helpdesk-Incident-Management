package com.resolveit.helpdesk.identity.service;

import com.resolveit.helpdesk.common.exception.UnauthorizedException;
import com.resolveit.helpdesk.identity.dto.AuthResponse;
import com.resolveit.helpdesk.identity.dto.LoginRequest;
import com.resolveit.helpdesk.identity.entity.RefreshToken;
import com.resolveit.helpdesk.identity.entity.User;
import com.resolveit.helpdesk.identity.repository.RefreshTokenRepository;
import com.resolveit.helpdesk.identity.repository.UserRepository;
import com.resolveit.helpdesk.security.jwt.JwtProperties;
import com.resolveit.helpdesk.security.jwt.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final JwtProperties jwtProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            JwtProperties jwtProperties
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.jwtProperties = jwtProperties;
    }

    public record LoginResult(AuthResponse authResponse, String rawRefreshToken) {}

    @Transactional
    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account has been deactivated. Please contact IT support.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String rawRefreshToken = generateSecureRandomToken();
        String tokenHash = JwtTokenProvider.hashToken(rawRefreshToken);
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs());

        RefreshToken refreshToken = new RefreshToken(user, tokenHash, expiresAt);
        refreshTokenRepository.save(refreshToken);

        String accessToken = tokenProvider.generateAccessToken(user);
        AuthResponse response = AuthResponse.of(
                accessToken,
                jwtProperties.getAccessTokenExpirationMs(),
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getDepartment()
        );

        return new LoginResult(response, rawRefreshToken);
    }

    @Transactional
    public LoginResult refreshAccessToken(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is missing");
        }

        String tokenHash = JwtTokenProvider.hashToken(rawRefreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        User user = storedToken.getUser();

        // Security check: Reuse detection!
        if (storedToken.isRevoked()) {
            log.error("SECURITY ALERT: Revoked refresh token reuse attempted for user {}! Revoking all sessions.", user.getEmail());
            refreshTokenRepository.revokeAllUserTokens(user);
            throw new UnauthorizedException("Security violation: Token reuse detected. Please re-authenticate.");
        }

        if (storedToken.isExpired() || !user.isActive()) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new UnauthorizedException("Refresh token expired or user inactive");
        }

        // Token rotation: Revoke current and issue replacement
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String newRawRefreshToken = generateSecureRandomToken();
        String newTokenHash = JwtTokenProvider.hashToken(newRawRefreshToken);
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs());

        RefreshToken newRefreshToken = new RefreshToken(user, newTokenHash, expiresAt);
        refreshTokenRepository.save(newRefreshToken);

        String newAccessToken = tokenProvider.generateAccessToken(user);
        AuthResponse response = AuthResponse.of(
                newAccessToken,
                jwtProperties.getAccessTokenExpirationMs(),
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getDepartment()
        );

        return new LoginResult(response, newRawRefreshToken);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String tokenHash = JwtTokenProvider.hashToken(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
    }

    private String generateSecureRandomToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
