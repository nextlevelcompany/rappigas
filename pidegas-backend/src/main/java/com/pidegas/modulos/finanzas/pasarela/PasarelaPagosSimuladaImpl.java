package com.pidegas.modulos.finanzas.pasarela;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class PasarelaPagosSimuladaImpl implements PasarelaPagos {

    private static final Logger log = LoggerFactory.getLogger(PasarelaPagosSimuladaImpl.class);

    @Override
    public ResultadoProcesamientoPago procesarPago(SolicitudPago solicitud) {
        log.info("Simulando procesamiento de pago con pasarela para pedido {}. Monto: S/ {}, Método: {}",
                solicitud.pedidoPublicId(), solicitud.monto(), solicitud.metodoPago());

        if (solicitud.monto() == null || solicitud.monto().compareTo(BigDecimal.ZERO) <= 0) {
            return ResultadoProcesamientoPago.fallido("El monto del pedido debe ser mayor a cero.");
        }

        if ("RECHAZAR_TEST".equalsIgnoreCase(solicitud.tokenTarjeta())) {
            log.warn("Pago simulado rechazado intencionalmente para prueba.");
            return ResultadoProcesamientoPago.fallido("Transacción rechazada por entidad financiera: Fondos insuficientes.");
        }

        String randomCode = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 999999));
        String refId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return switch (solicitud.metodoPago()) {
            case YAPE -> ResultadoProcesamientoPago.exitoso(
                    "YAPE-" + refId,
                    "YP-" + randomCode.substring(0, 4),
                    "Pago aprobado instantáneamente vía Yape.",
                    "{\"banco\":\"BCP\",\"canal\":\"YAPE_QR\"}"
            );
            case PLIN -> ResultadoProcesamientoPago.exitoso(
                    "PLIN-" + refId,
                    "PL-" + randomCode.substring(0, 4),
                    "Pago aprobado instantáneamente vía Plin.",
                    "{\"banco\":\"INTERBANK_BBVA_SCOTIA\",\"canal\":\"PLIN_MOVIL\"}"
            );
            case TARJETA -> ResultadoProcesamientoPago.exitoso(
                    "CARD-" + refId,
                    "AUTH-" + randomCode,
                    "Pago con tarjeta de débito/crédito aprobado exitosamente.",
                    "{\"marca\":\"VISA/MASTERCARD\",\"tipo\":\"DEBITO\"}"
            );
            case EFECTIVO -> ResultadoProcesamientoPago.exitoso(
                    "EFEC-" + refId,
                    "CASH-PENDING",
                    "Pago contra entrega en efectivo registrado.",
                    "{\"modalidad\":\"CONTRA_ENTREGA\"}"
            );
        };
    }

    @Override
    public ResultadoProcesamientoPago verificarEstado(String referenciaTransaccion) {
        return ResultadoProcesamientoPago.exitoso(
                referenciaTransaccion,
                "VERIFIED",
                "Transacción verificada correctamente en pasarela.",
                "{\"estado\":\"CONFIRMADA\"}"
        );
    }
}
