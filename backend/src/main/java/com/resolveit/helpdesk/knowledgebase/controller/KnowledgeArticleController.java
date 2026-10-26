package com.resolveit.helpdesk.knowledgebase.controller;

import com.resolveit.helpdesk.common.response.PagedResponse;
import com.resolveit.helpdesk.knowledgebase.dto.KnowledgeArticleResponse;
import com.resolveit.helpdesk.knowledgebase.service.KnowledgeArticleService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/knowledge-base")
public class KnowledgeArticleController {

    private final KnowledgeArticleService articleService;

    public KnowledgeArticleController(KnowledgeArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping("/articles")
    public ResponseEntity<PagedResponse<KnowledgeArticleResponse>> listArticles(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(PagedResponse.from(articleService.searchPublishedArticles(search, pageable)));
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<KnowledgeArticleResponse> getArticle(@PathVariable UUID id) {
        return ResponseEntity.ok(articleService.getArticleById(id));
    }
}
