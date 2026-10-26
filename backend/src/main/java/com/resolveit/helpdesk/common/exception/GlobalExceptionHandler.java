package com.resolveit.helpdesk.common.exception;

import com.resolveit.helpdesk.common.response.ProblemDetailResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetailResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        log.warn("[{}] Resource not found: {}", traceId, ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ProblemDetailResponse.of(
                        "https://api.resolveit.com/errors/not-found",
                        "Resource Not Found",
                        HttpStatus.NOT_FOUND.value(),
                        ex.getMessage(),
                        request.getRequestURI(),
                        traceId
                )
        );
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ProblemDetailResponse> handleBusinessRule(BusinessRuleException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        log.warn("[{}] Business rule violation: {}", traceId, ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                ProblemDetailResponse.of(
                        "https://api.resolveit.com/errors/business-rule-violation",
                        "Business Rule Violation",
                        HttpStatus.UNPROCESSABLE_ENTITY.value(),
                        ex.getMessage(),
                        request.getRequestURI(),
                        traceId
                )
        );
    }

    @ExceptionHandler({OptimisticLockingFailureException.class, ConflictException.class})
    public ResponseEntity<ProblemDetailResponse> handleConflict(Exception ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        log.warn("[{}] Conflict/Optimistic lock failure: {}", traceId, ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ProblemDetailResponse.of(
                        "https://api.resolveit.com/errors/conflict",
                        "Conflict / Concurrent Modification",
                        HttpStatus.CONFLICT.value(),
                        "The resource was modified concurrently by another transaction. Please reload and retry.",
                        request.getRequestURI(),
                        traceId
                )
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetailResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        List<ProblemDetailResponse.InvalidParam> invalidParams = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> new ProblemDetailResponse.InvalidParam(err.getField(), err.getDefaultMessage()))
                .toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ProblemDetailResponse.withParams(
                        "https://api.resolveit.com/errors/validation-error",
                        "Validation Failure",
                        HttpStatus.BAD_REQUEST.value(),
                        "One or more request parameters failed validation.",
                        request.getRequestURI(),
                        traceId,
                        invalidParams
                )
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetailResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        log.warn("[{}] Forbidden access attempt on {}: {}", traceId, request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ProblemDetailResponse.of(
                        "https://api.resolveit.com/errors/forbidden",
                        "Forbidden",
                        HttpStatus.FORBIDDEN.value(),
                        "You do not have permission to perform this action on the requested resource.",
                        request.getRequestURI(),
                        traceId
                )
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetailResponse> handleAuthException(AuthenticationException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        log.warn("[{}] Authentication failure on {}: {}", traceId, request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ProblemDetailResponse.of(
                        "https://api.resolveit.com/errors/unauthorized",
                        "Unauthorized",
                        HttpStatus.UNAUTHORIZED.value(),
                        "Full authentication is required to access this resource.",
                        request.getRequestURI(),
                        traceId
                )
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetailResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        log.error("[{}] Internal server error on {}:", traceId, request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ProblemDetailResponse.of(
                        "https://api.resolveit.com/errors/internal-server-error",
                        "Internal Server Error",
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "An unexpected server error occurred. Reference correlation ID: " + traceId,
                        request.getRequestURI(),
                        traceId
                )
        );
    }

    private String generateTraceId() {
        return "req-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
