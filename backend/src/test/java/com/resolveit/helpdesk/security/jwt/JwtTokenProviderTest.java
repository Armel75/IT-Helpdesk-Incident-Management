package com.resolveit.helpdesk.security.jwt;

import com.resolveit.helpdesk.identity.entity.Role;
import com.resolveit.helpdesk.identity.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private User testUser;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        // 256-bit test key
        properties.setSecret("dGVzdC1qd3Qtc2VjcmV0LWtleS1mb3ItZGV2ZWxvcG1lbnQtcHVycG9zZXMtb25seS12ZXJ5LXNlY3VyZQ==");
        properties.setAccessTokenExpirationMs(60000);
        properties.setIssuer("resolveit-test");

        tokenProvider = new JwtTokenProvider(properties);

        testUser = new User("admin@resolveit.internal", "hash", "Admin User", Role.ROLE_ADMIN, "IT");
        testUser.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Generates and validates a signed JWT token")
    void testGenerateAndValidateToken() {
        String token = tokenProvider.generateAccessToken(testUser);
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(testUser.getId(), tokenProvider.getUserIdFromToken(token));
        assertEquals("ROLE_ADMIN", tokenProvider.getRoleFromToken(token));
    }

    @Test
    @DisplayName("Tampered token fails validation")
    void testTamperedTokenFails() {
        String token = tokenProvider.generateAccessToken(testUser);
        String tampered = token.substring(0, token.length() - 5) + "abcde";
        assertFalse(tokenProvider.validateToken(tampered));
    }

    @Test
    @DisplayName("Hashes raw refresh tokens with SHA-256 reliably")
    void testSha256Hashing() {
        String rawToken = "super-secret-refresh-token-value-12345";
        String hash1 = JwtTokenProvider.hashToken(rawToken);
        String hash2 = JwtTokenProvider.hashToken(rawToken);

        assertNotNull(hash1);
        assertEquals(64, hash1.length()); // SHA-256 in hex is 64 chars
        assertEquals(hash1, hash2);
    }
}
