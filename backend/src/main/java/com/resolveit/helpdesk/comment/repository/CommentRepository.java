package com.resolveit.helpdesk.comment.repository;

import com.resolveit.helpdesk.comment.entity.Comment;
import com.resolveit.helpdesk.comment.entity.CommentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByTicketIdOrderByCreatedAtAsc(UUID ticketId);
    List<Comment> findByTicketIdAndCommentTypeOrderByCreatedAtAsc(UUID ticketId, CommentType commentType);
}
