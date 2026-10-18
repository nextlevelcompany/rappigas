package com.pidegas.nucleo.seguridad;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Filtro de Rate Limiting para mitigar ataques de fuerza bruta y DDoS en endpoints sensibles.
 */
@Component
public class FiltroRateLimit extends OncePerRequestFilter {

    private static final int MAX_SOLICITUDES_POR_VENTANA = 15;
    private static final long VENTANA_TIEMPO_MS = 60_000L; // 1 minuto

    private final Map<String, RegistroVentana> historialSolicitudes = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Aplicar rate limiting estricto únicamente en autenticación sensible
        if (path.contains("/api/v1/auth/login") && "POST".equalsIgnoreCase(request.getMethod())) {
            String ipCliente = obtenerIpCliente(request);
            long ahora = System.currentTimeMillis();

            RegistroVentana ventana = historialSolicitudes.compute(ipCliente, (ip, reg) -> {
                if (reg == null || ahora - reg.inicioVentana > VENTANA_TIEMPO_MS) {
                    return new RegistroVentana(ahora, new AtomicInteger(1));
                }
                reg.contador.incrementAndGet();
                return reg;
            });

            if (ventana.contador.get() > MAX_SOLICITUDES_POR_VENTANA) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"mensaje\":\"Demasiadas solicitudes de inicio de sesión. Por favor espere un momento.\",\"status\":429}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String obtenerIpCliente(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private static class RegistroVentana {
        final long inicioVentana;
        final AtomicInteger contador;

        RegistroVentana(long inicioVentana, AtomicInteger contador) {
            this.inicioVentana = inicioVentana;
            this.contador = contador;
        }
    }
}
