package com.resolveit.helpdesk.common.response;

import java.time.Instant;
import java.util.List;

public record ProblemDetailResponse(
        String type,
        String title,
        int status,
        String detail,
        String instance,
        Instant timestamp,
        String traceId,
        List<InvalidParam> invalidParams
) {
    public record InvalidParam(String name, String reason) {}

    public static ProblemDetailResponse of(String type, String title, int status, String detail, String instance, String traceId) {
        return new ProblemDetailResponse(type, title, status, detail, instance, Instant.now(), traceId, null);
    }

    public static ProblemDetailResponse withParams(String type, String title, int status, String detail, String instance, String traceId, List<InvalidParam> invalidParams) {
        return new ProblemDetailResponse(type, title, status, detail, instance, Instant.now(), traceId, invalidParams);
    }
}
