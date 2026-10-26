package com.resolveit.helpdesk.knowledgebase.service;

import com.resolveit.helpdesk.common.exception.ResourceNotFoundException;
import com.resolveit.helpdesk.knowledgebase.dto.KnowledgeArticleResponse;
import com.resolveit.helpdesk.knowledgebase.entity.KnowledgeArticle;
import com.resolveit.helpdesk.knowledgebase.repository.KnowledgeArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class KnowledgeArticleService {

    private final KnowledgeArticleRepository articleRepository;

    public KnowledgeArticleService(KnowledgeArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Transactional(readOnly = true)
    public Page<KnowledgeArticleResponse> searchPublishedArticles(String search, Pageable pageable) {
        return articleRepository.searchPublished(search, pageable).map(KnowledgeArticleResponse::from);
    }

    @Transactional
    public KnowledgeArticleResponse getArticleById(UUID id) {
        KnowledgeArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeArticle", "id", id));
        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);
        return KnowledgeArticleResponse.from(article);
    }
}
