package com.pidegas.modulos.finanzas.pasarela;

import com.pidegas.modulos.pedidos.dominio.MetodoPago;
import java.math.BigDecimal;
import java.util.UUID;

public record SolicitudPago(
        UUID pedidoPublicId,
        BigDecimal monto,
        MetodoPago metodoPago,
        String telefonoYapePlin,
        String tokenTarjeta,
        String nombreTitular
) {}
