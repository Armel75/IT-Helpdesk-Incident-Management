package com.resolveit.helpdesk.identity.dto;

import com.resolveit.helpdesk.identity.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email format")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 10, message = "Password must be at least 10 characters")
        String password,

        @NotBlank(message = "Full name is required")
        String fullName,

        @NotNull(message = "Role is required")
        Role role,

        @NotBlank(message = "Department is required")
        String department
) {}
