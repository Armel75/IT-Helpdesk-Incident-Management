package com.resolveit.helpdesk.comment.dto;

import com.resolveit.helpdesk.comment.entity.CommentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
        @NotBlank(message = "Comment content cannot be blank")
        @Size(min = 2, max = 5000, message = "Comment content must be between 2 and 5000 characters")
        String content,

        @NotNull(message = "Comment type is required")
        CommentType commentType
) {}
