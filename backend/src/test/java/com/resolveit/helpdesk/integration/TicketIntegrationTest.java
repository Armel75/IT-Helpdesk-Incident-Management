package com.resolveit.helpdesk.integration;

import com.resolveit.helpdesk.ticket.dto.CreateTicketRequest;
import com.resolveit.helpdesk.ticket.dto.TicketResponse;
import com.resolveit.helpdesk.ticket.entity.TicketPriority;
import com.resolveit.helpdesk.ticket.entity.TicketSeverity;
import com.resolveit.helpdesk.ticket.entity.TicketType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
class TicketIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_resolveit")
            .withUsername("test_user")
            .withPassword("test_pass");

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @DisplayName("Application context loads with Testcontainers PostgreSQL and Flyway migrations")
    void contextLoads() {
        assertTrue(postgres.isRunning());
    }

    @Test
    @DisplayName("Unauthenticated ticket query returns 401 Unauthorized")
    void testUnauthenticatedAccessReturns401() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/v1/tickets", String.class);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
