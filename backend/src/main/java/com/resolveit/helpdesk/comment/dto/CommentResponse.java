package com.resolveit.helpdesk.comment.dto;

import com.resolveit.helpdesk.comment.entity.Comment;
import com.resolveit.helpdesk.comment.entity.CommentType;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        UUID ticketId,
        UUID authorId,
        String authorName,
        String authorEmail,
        String authorRole,
        String content,
        CommentType commentType,
        Instant createdAt
) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getTicket().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getFullName(),
                comment.getAuthor().getEmail(),
                comment.getAuthor().getRole().name(),
                comment.getContent(),
                comment.getCommentType(),
                comment.getCreatedAt()
        );
    }
}
