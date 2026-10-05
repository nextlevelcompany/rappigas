package com.pidegas.modulos.finanzas.sunat;

import java.math.BigDecimal;
import java.util.UUID;

public record SolicitudComprobante(
        UUID pedidoPublicId,
        String tipoComprobante,
        String rucDniReceptor,
        String razonSocialReceptor,
        BigDecimal subtotal,
        BigDecimal igv,
        BigDecimal total
) {}
