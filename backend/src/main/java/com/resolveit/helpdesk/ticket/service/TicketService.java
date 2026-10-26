package com.resolveit.helpdesk.ticket.service;

import com.resolveit.helpdesk.asset.entity.Asset;
import com.resolveit.helpdesk.asset.repository.AssetRepository;
import com.resolveit.helpdesk.category.entity.Category;
import com.resolveit.helpdesk.category.repository.CategoryRepository;
import com.resolveit.helpdesk.common.exception.ForbiddenException;
import com.resolveit.helpdesk.common.exception.ResourceNotFoundException;
import com.resolveit.helpdesk.history.service.TicketHistoryService;
import com.resolveit.helpdesk.identity.entity.Role;
import com.resolveit.helpdesk.identity.entity.User;
import com.resolveit.helpdesk.identity.repository.UserRepository;
import com.resolveit.helpdesk.security.UserPrincipal;
import com.resolveit.helpdesk.sla.dto.TicketSlaResponse;
import com.resolveit.helpdesk.sla.service.SlaCalculationService;
import com.resolveit.helpdesk.team.entity.Team;
import com.resolveit.helpdesk.team.repository.TeamRepository;
import com.resolveit.helpdesk.ticket.dto.AssignTicketRequest;
import com.resolveit.helpdesk.ticket.dto.CreateTicketRequest;
import com.resolveit.helpdesk.ticket.dto.TicketResponse;
import com.resolveit.helpdesk.ticket.dto.TransitionTicketRequest;
import com.resolveit.helpdesk.ticket.entity.*;
import com.resolveit.helpdesk.ticket.repository.TicketRepository;
import com.resolveit.helpdesk.ticket.statemachine.TicketStateMachine;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TeamRepository teamRepository;
    private final AssetRepository assetRepository;
    private final SlaCalculationService slaCalculationService;
    private final TicketStateMachine stateMachine;
    private final TicketHistoryService historyService;
    private final AtomicInteger ticketCounter = new AtomicInteger(100);

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            TeamRepository teamRepository,
            AssetRepository assetRepository,
            SlaCalculationService slaCalculationService,
            TicketStateMachine stateMachine,
            TicketHistoryService historyService
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.teamRepository = teamRepository;
        this.assetRepository = assetRepository;
        this.slaCalculationService = slaCalculationService;
        this.stateMachine = stateMachine;
        this.historyService = historyService;
    }

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, UserPrincipal currentUser) {
        User requester = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        TicketSeverity severity = request.severity() != null ? request.severity() : TicketSeverity.SEV3;
        String prefix = request.ticketType() == TicketType.INCIDENT ? "INC" : "SRQ";
        String ticketNumber = String.format("%s-%d-%05d", prefix, Year.now().getValue(), ticketCounter.incrementAndGet());

        Ticket ticket = new Ticket(
                ticketNumber,
                request.title().trim(),
                request.description().trim(),
                request.ticketType(),
                request.priority(),
                severity,
                requester,
                category
        );

        if (request.assetId() != null) {
            Asset asset = assetRepository.findById(request.assetId()).orElse(null);
            ticket.setAsset(asset);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Initialize and bind SLA policy
        slaCalculationService.createTicketSla(
                savedTicket.getId(),
                savedTicket.getPriority().name(),
                savedTicket.getTicketType().name()
        );

        historyService.recordEvent(savedTicket.getId(), requester.getId(), "TICKET_CREATED", "status", null, "OPEN");

        TicketSlaResponse slaResponse = slaCalculationService.getTicketSla(savedTicket.getId()).orElse(null);
        return TicketResponse.from(savedTicket, slaResponse);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> listTickets(
            TicketStatus status,
            TicketPriority priority,
            UUID categoryId,
            UUID agentId,
            String search,
            UserPrincipal currentUser,
            Pageable pageable
    ) {
        UUID requesterFilter = null;
        if (currentUser.getRole() == Role.ROLE_EMPLOYEE) {
            // Strictly scope employee to their own tickets
            requesterFilter = currentUser.getId();
        }

        Page<Ticket> tickets = ticketRepository.findWithFilters(status, priority, requesterFilter, agentId, categoryId, search, pageable);
        return tickets.map(t -> {
            TicketSlaResponse sla = slaCalculationService.getTicketSla(t.getId()).orElse(null);
            return TicketResponse.from(t, sla);
        });
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(UUID id, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));

        // Object-level authorization check
        if (currentUser.getRole() == Role.ROLE_EMPLOYEE && !ticket.getRequester().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Access denied: You are not authorized to view this ticket.");
        }

        TicketSlaResponse sla = slaCalculationService.getTicketSla(ticket.getId()).orElse(null);
        return TicketResponse.from(ticket, sla);
    }

    @Transactional
    public TicketResponse transitionTicket(UUID id, TransitionTicketRequest request, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));

        // Object-level authorization
        if (currentUser.getRole() == Role.ROLE_EMPLOYEE && !ticket.getRequester().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Access denied: Cannot modify ticket owned by another user.");
        }

        // Optimistic locking check
        if (!ticket.getVersion().equals(request.version())) {
            throw new OptimisticLockingFailureException("Ticket was modified concurrently by another user.");
        }

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus targetStatus = request.targetStatus();

        stateMachine.validateTransition(ticket, targetStatus, currentUser.getRole(), request.resolutionSummary());

        Instant now = Instant.now();
        ticket.setStatus(targetStatus);

        // Record first response if transitioning out of OPEN
        if (oldStatus == TicketStatus.OPEN && ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(now);
            slaCalculationService.recordFirstResponse(ticket.getId(), now);
        }

        // Record resolution
        if (targetStatus == TicketStatus.RESOLVED) {
            ticket.setResolutionSummary(request.resolutionSummary());
            ticket.setResolvedAt(now);
            slaCalculationService.recordResolution(ticket.getId(), now);
        }

        if (targetStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(now);
        }

        if (targetStatus == TicketStatus.REOPENED) {
            ticket.setResolvedAt(null);
            ticket.setClosedAt(null);
        }

        Ticket updated = ticketRepository.save(ticket);
        historyService.recordEvent(ticket.getId(), currentUser.getId(), "STATUS_CHANGE", "status", oldStatus.name(), targetStatus.name());

        TicketSlaResponse sla = slaCalculationService.getTicketSla(ticket.getId()).orElse(null);
        return TicketResponse.from(updated, sla);
    }

    @Transactional
    public TicketResponse assignTicket(UUID id, AssignTicketRequest request, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));

        if (currentUser.getRole() == Role.ROLE_EMPLOYEE) {
            throw new ForbiddenException("Employees cannot reassign tickets.");
        }

        if (request.version() != null && !ticket.getVersion().equals(request.version())) {
            throw new OptimisticLockingFailureException("Ticket was modified concurrently.");
        }

        String oldAgent = ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getFullName() : "Unassigned";

        if (request.agentId() != null) {
            User agent = userRepository.findById(request.agentId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.agentId()));
            ticket.setAssignedAgent(agent);
            historyService.recordEvent(ticket.getId(), currentUser.getId(), "ASSIGNED", "assigned_agent", oldAgent, agent.getFullName());
        }

        if (request.teamId() != null) {
            Team team = teamRepository.findById(request.teamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team", "id", request.teamId()));
            ticket.setAssignedTeam(team);
        }

        Ticket updated = ticketRepository.save(ticket);
        TicketSlaResponse sla = slaCalculationService.getTicketSla(ticket.getId()).orElse(null);
        return TicketResponse.from(updated, sla);
    }
}
