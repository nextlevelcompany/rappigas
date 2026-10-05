package com.pidegas.modulos.inventario.aplicacion;

import com.pidegas.modulos.inventario.dto.*;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface InventarioServicio {

    List<AlmacenDetalleDto> listarAlmacenes();

    AlmacenDetalleDto crearAlmacen(CrearAlmacenDto dto);

    List<StockProductoDetalleDto> consultarStock(UUID almacenPublicId);

    StockProductoDetalleDto registrarMovimiento(RegistrarMovimientoDto dto);

    void descontarStockPorPedido(Pedido pedido);

    Page<MovimientoStockDetalleDto> obtenerKardex(Pageable pageable);

    ResumenInventarioDto obtenerResumenInventario();
}
