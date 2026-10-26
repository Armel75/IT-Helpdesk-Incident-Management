package com.resolveit.helpdesk.category.dto;

import com.resolveit.helpdesk.category.entity.Category;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        UUID parentId,
        String name,
        String code,
        String description,
        boolean active
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getParentId(),
                category.getName(),
                category.getCode(),
                category.getDescription(),
                category.isActive()
        );
    }
}
