package com.resolveit.helpdesk.knowledgebase.dto;

import com.resolveit.helpdesk.knowledgebase.entity.KnowledgeArticle;

import java.time.Instant;
import java.util.UUID;

public record KnowledgeArticleResponse(
        UUID id,
        String title,
        String content,
        UUID categoryId,
        String categoryName,
        UUID authorId,
        String authorName,
        String status,
        int viewCount,
        Instant publishedAt,
        Instant createdAt
) {
    public static KnowledgeArticleResponse from(KnowledgeArticle article) {
        return new KnowledgeArticleResponse(
                article.getId(),
                article.getTitle(),
                article.getContent(),
                article.getCategory() != null ? article.getCategory().getId() : null,
                article.getCategory() != null ? article.getCategory().getName() : null,
                article.getAuthor().getId(),
                article.getAuthor().getFullName(),
                article.getStatus(),
                article.getViewCount(),
                article.getPublishedAt(),
                article.getCreatedAt()
        );
    }
}
