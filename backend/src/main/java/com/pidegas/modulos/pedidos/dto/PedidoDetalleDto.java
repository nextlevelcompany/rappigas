package com.pidegas.modulos.pedidos.dto;

import com.pidegas.modulos.pedidos.dominio.EstadoPago;
import com.pidegas.modulos.pedidos.dominio.EstadoPedido;
import com.pidegas.modulos.pedidos.dominio.MetodoPago;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PedidoDetalleDto(
        UUID publicId,
        Long tenantId,
        UUID empresaPublicId,
        String nombreEmpresa,
        String telefonoEmpresa,
        UUID clientePublicId,
        String nombreCliente,
        String telefonoCliente,
        String emailCliente,
        UUID repartidorPublicId,
        String nombreRepartidor,
        String telefonoRepartidor,
        String vehiculoPlaca,
        BigDecimal subtotal,
        BigDecimal descuento,
        BigDecimal total,
        EstadoPedido estado,
        MetodoPago metodoPago,
        EstadoPago estadoPago,
        String direccionEntrega,
        String referenciaDireccion,
        Double latitud,
        Double longitud,
        String notasCliente,
        String codigoConfirmacion,
        OffsetDateTime fechaEntrega,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<DetallePedidoItemDto> items
) {}
