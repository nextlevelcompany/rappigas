package com.pidegas.modulos.finanzas.dto;

import com.pidegas.modulos.finanzas.dominio.EstadoTransaccionPago;
import com.pidegas.modulos.pedidos.dominio.MetodoPago;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PagoDetalleDto(
        UUID publicId,
        UUID pedidoPublicId,
        Long tenantId,
        BigDecimal monto,
        MetodoPago metodoPago,
        EstadoTransaccionPago estado,
        String referenciaTransaccion,
        String codigoAutorizacion,
        OffsetDateTime createdAt
) {}
