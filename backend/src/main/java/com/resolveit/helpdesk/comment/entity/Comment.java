package com.resolveit.helpdesk.comment.entity;

import com.resolveit.helpdesk.identity.entity.User;
import com.resolveit.helpdesk.ticket.entity.Ticket;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "comment_type", nullable = false, length = 50)
    private CommentType commentType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Comment() {}

    public Comment(Ticket ticket, User author, String content, CommentType commentType) {
        this.ticket = ticket;
        this.author = author;
        this.content = content;
        this.commentType = commentType;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public Ticket getTicket() { return ticket; }
    public User getAuthor() { return author; }
    public String getContent() { return content; }
    public CommentType getCommentType() { return commentType; }
    public Instant getCreatedAt() { return createdAt; }
}
