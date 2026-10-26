package com.resolveit.helpdesk.comment.controller;

import com.resolveit.helpdesk.comment.dto.CommentResponse;
import com.resolveit.helpdesk.comment.dto.CreateCommentRequest;
import com.resolveit.helpdesk.comment.service.CommentService;
import com.resolveit.helpdesk.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID ticketId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(commentService.getCommentsForTicket(ticketId, currentUser));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID ticketId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                commentService.addComment(ticketId, request, currentUser)
        );
    }
}
