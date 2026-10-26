package com.resolveit.helpdesk.knowledgebase.repository;

import com.resolveit.helpdesk.knowledgebase.entity.KnowledgeArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, UUID> {
    Page<KnowledgeArticle> findByStatus(String status, Pageable pageable);

    @Query("SELECT a FROM KnowledgeArticle a WHERE a.status = 'PUBLISHED' AND " +
            "(:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<KnowledgeArticle> searchPublished(@Param("search") String search, Pageable pageable);
}
