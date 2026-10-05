package com.pidegas.modulos.pedidos.dto;

import com.pidegas.modulos.pedidos.dominio.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record ActualizarEstadoPedidoDto(
        @NotNull(message = "El nuevo estado del pedido es obligatorio")
        EstadoPedido nuevoEstado,

        String codigoConfirmacion,

        String motivoCancelacion
) {}
