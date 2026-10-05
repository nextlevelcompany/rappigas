package com.pidegas.modulos.soporte.aplicacion;

import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.soporte.dto.*;

import java.util.List;
import java.util.UUID;

public interface SoporteServicio {

    TicketDetalleDto crearTicketCliente(Usuario cliente, CrearTicketDto dto);

    List<TicketDetalleDto> listarTicketsCliente(Usuario cliente);

    TicketDetalleDto obtenerTicketCliente(Usuario cliente, UUID publicId);

    TicketDetalleDto responderTicket(Usuario usuarioActual, UUID publicId, ResponderTicketDto dto);

    List<TicketDetalleDto> listarTicketsEmpresa(Usuario usuarioEmpresa);

    TicketDetalleDto obtenerTicketEmpresa(Usuario usuarioEmpresa, UUID publicId);

    TicketDetalleDto actualizarEstadoEmpresa(Usuario usuarioEmpresa, UUID publicId, ActualizarEstadoTicketDto dto);

    List<TicketDetalleDto> listarTicketsAdmin();

    TicketDetalleDto obtenerTicketAdmin(UUID publicId);

    TicketDetalleDto actualizarEstadoAdmin(UUID publicId, ActualizarEstadoTicketDto dto);

    ResumenSoporteDto obtenerMetricasEmpresa(Usuario usuarioEmpresa);

    ResumenSoporteDto obtenerMetricasAdmin();
}
