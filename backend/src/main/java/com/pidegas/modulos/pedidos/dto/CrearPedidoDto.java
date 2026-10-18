package com.pidegas.modulos.pedidos.dto;

import com.pidegas.modulos.pedidos.dominio.MetodoPago;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record CrearPedidoDto(
        @NotNull(message = "El public_id de la empresa distribuidora es obligatorio")
        UUID empresaPublicId,

        @NotNull(message = "La latitud es obligatoria")
        Double latitud,

        @NotNull(message = "La longitud es obligatoria")
        Double longitud,

        @NotBlank(message = "La dirección de entrega es obligatoria")
        @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
        String direccionEntrega,

        @Size(max = 255, message = "La referencia no puede exceder 255 caracteres")
        String referenciaDireccion,

        String notasCliente,

        @NotNull(message = "El método de pago es obligatorio")
        MetodoPago metodoPago,

        @NotEmpty(message = "El pedido debe contener al menos un producto")
        @Valid
        List<ItemPedidoDto> items
) {}
