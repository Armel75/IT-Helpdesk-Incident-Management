package com.resolveit.helpdesk.category.service;

import com.resolveit.helpdesk.category.dto.CategoryResponse;
import com.resolveit.helpdesk.category.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listActiveCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(CategoryResponse::from)
                .toList();
    }
}
