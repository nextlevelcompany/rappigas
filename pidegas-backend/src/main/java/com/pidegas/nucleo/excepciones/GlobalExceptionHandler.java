package com.pidegas.nucleo.excepciones;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> detalles = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .map(error -> {
                    if (error instanceof FieldError fieldError) {
                        return fieldError.getField() + ": " + fieldError.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                })
                .toList();

        ErrorResponse errorResponse = ErrorResponse.de(
                HttpStatus.BAD_REQUEST.value(),
                "Error de Validación",
                "Los datos enviados contienen errores de validación.",
                request.getRequestURI(),
                UUID.randomUUID().toString(),
                detalles
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.de(
                HttpStatus.FORBIDDEN.value(),
                "Acceso Denegado",
                "No tienes permisos suficientes para realizar esta acción.",
                request.getRequestURI(),
                UUID.randomUUID().toString()
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.de(
                HttpStatus.BAD_REQUEST.value(),
                "Solicitud Inválida",
                ex.getMessage(),
                request.getRequestURI(),
                UUID.randomUUID().toString()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
            Exception ex, HttpServletRequest request) {
        log.error("Excepción no controlada en {}: ", request.getRequestURI(), ex);
        ErrorResponse errorResponse = ErrorResponse.de(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error Interno",
                ex.getMessage() != null ? ex.getMessage() : "Ocurrió un error inesperado al procesar la solicitud.",
                request.getRequestURI(),
                UUID.randomUUID().toString()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
