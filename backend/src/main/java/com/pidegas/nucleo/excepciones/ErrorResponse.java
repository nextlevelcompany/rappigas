package com.pidegas.nucleo.excepciones;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String mensaje,
        String path,
        String traceId,
        List<String> detalles
) {
    public static ErrorResponse de(int status, String error, String mensaje, String path, String traceId) {
        return new ErrorResponse(Instant.now(), status, error, mensaje, path, traceId, List.of());
    }

    public static ErrorResponse de(int status, String error, String mensaje, String path, String traceId, List<String> detalles) {
        return new ErrorResponse(Instant.now(), status, error, mensaje, path, traceId, detalles != null ? detalles : List.of());
    }
}
