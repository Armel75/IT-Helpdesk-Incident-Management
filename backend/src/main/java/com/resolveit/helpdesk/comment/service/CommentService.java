package com.resolveit.helpdesk.comment.service;

import com.resolveit.helpdesk.comment.dto.CommentResponse;
import com.resolveit.helpdesk.comment.dto.CreateCommentRequest;
import com.resolveit.helpdesk.comment.entity.Comment;
import com.resolveit.helpdesk.comment.entity.CommentType;
import com.resolveit.helpdesk.comment.repository.CommentRepository;
import com.resolveit.helpdesk.common.exception.ForbiddenException;
import com.resolveit.helpdesk.common.exception.ResourceNotFoundException;
import com.resolveit.helpdesk.identity.entity.Role;
import com.resolveit.helpdesk.identity.entity.User;
import com.resolveit.helpdesk.identity.repository.UserRepository;
import com.resolveit.helpdesk.security.UserPrincipal;
import com.resolveit.helpdesk.sla.service.SlaCalculationService;
import com.resolveit.helpdesk.ticket.entity.Ticket;
import com.resolveit.helpdesk.ticket.entity.TicketStatus;
import com.resolveit.helpdesk.ticket.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SlaCalculationService slaCalculationService;

    public CommentService(
            CommentRepository commentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository,
            SlaCalculationService slaCalculationService
    ) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.slaCalculationService = slaCalculationService;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForTicket(UUID ticketId, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (currentUser.getRole() == Role.ROLE_EMPLOYEE) {
            // IDOR check
            if (!ticket.getRequester().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Access denied to ticket comments.");
            }
            // Strict filtering: Employees never see INTERNAL_NOTE entries
            return commentRepository.findByTicketIdAndCommentTypeOrderByCreatedAtAsc(ticketId, CommentType.PUBLIC)
                    .stream().map(CommentResponse::from).toList();
        }

        // Technicians can view both public comments and internal notes
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(CommentResponse::from).toList();
    }

    @Transactional
    public CommentResponse addComment(UUID ticketId, CreateCommentRequest request, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        // Check IDOR for employee
        if (currentUser.getRole() == Role.ROLE_EMPLOYEE) {
            if (!ticket.getRequester().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Access denied: Cannot comment on another user's ticket.");
            }
            if (request.commentType() == CommentType.INTERNAL_NOTE) {
                throw new ForbiddenException("Employees are strictly forbidden from creating internal technician notes.");
            }
        }

        User author = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Comment comment = new Comment(ticket, author, request.content().trim(), request.commentType());
        Comment saved = commentRepository.save(comment);

        // If ticket was in OPEN status and an agent/manager posted a public comment, record first response
        if (ticket.getStatus() == TicketStatus.OPEN && currentUser.getRole() != Role.ROLE_EMPLOYEE && ticket.getFirstResponseAt() == null) {
            Instant now = Instant.now();
            ticket.setFirstResponseAt(now);
            ticketRepository.save(ticket);
            slaCalculationService.recordFirstResponse(ticket.getId(), now);
        }

        return CommentResponse.from(saved);
    }
}
