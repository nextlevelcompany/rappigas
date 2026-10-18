package com.pidegas.modulos.fidelizacion.aplicacion;

import com.pidegas.modulos.fidelizacion.dto.*;
import com.pidegas.modulos.pedidos.dominio.Pedido;

import java.util.List;

public interface FidelizacionServicio {

    BilleteraPuntosDto obtenerBilleteraCliente(String emailCliente);

    List<MovimientoPuntosDto> obtenerMovimientosPuntos(String emailCliente);

    void acumularPuntosPorPedido(Pedido pedido);

    ResultadoValidacionCuponDto validarCupon(ValidarCuponDto dto);

    CuponDetalleDto crearCupon(CrearCuponDto dto);

    List<CuponDetalleDto> listarCuponesEmpresa();
}
