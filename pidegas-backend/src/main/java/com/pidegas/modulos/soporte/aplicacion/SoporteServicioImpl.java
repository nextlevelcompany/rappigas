package com.pidegas.modulos.soporte.aplicacion;

import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.modulos.pedidos.repositorio.PedidoRepositorio;
import com.pidegas.modulos.soporte.dominio.EstadoTicket;
import com.pidegas.modulos.soporte.dominio.MensajeTicket;
import com.pidegas.modulos.soporte.dominio.PrioridadTicket;
import com.pidegas.modulos.soporte.dominio.TicketSoporte;
import com.pidegas.modulos.soporte.dto.*;
import com.pidegas.modulos.soporte.repositorio.MensajeTicketRepositorio;
import com.pidegas.modulos.soporte.repositorio.TicketSoporteRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SoporteServicioImpl implements SoporteServicio {

    private final TicketSoporteRepositorio ticketSoporteRepositorio;
    private final MensajeTicketRepositorio mensajeTicketRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final EmpresaRepositorio empresaRepositorio;
    private final PedidoRepositorio pedidoRepositorio;

    public SoporteServicioImpl(
            TicketSoporteRepositorio ticketSoporteRepositorio,
            MensajeTicketRepositorio mensajeTicketRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            EmpresaRepositorio empresaRepositorio,
            PedidoRepositorio pedidoRepositorio
    ) {
        this.ticketSoporteRepositorio = ticketSoporteRepositorio;
        this.mensajeTicketRepositorio = mensajeTicketRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.empresaRepositorio = empresaRepositorio;
        this.pedidoRepositorio = pedidoRepositorio;
    }

    private Long obtenerTenantIdRequerido(Usuario usuario) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            tenantId = empresaRepositorio.findByUsuarioAdminId(usuario.getId())
                    .map(Empresa::getId)
                    .orElseThrow(() -> new AccessDeniedException("El usuario no tiene una distribuidora asignada."));
        }
        return tenantId;
    }

    @Override
    public TicketDetalleDto crearTicketCliente(Usuario cliente, CrearTicketDto dto) {
        Long pedidoId = null;
        Long tenantId = null;
        if (dto.getPedidoPublicId() != null) {
            Pedido pedido = pedidoRepositorio.findByPublicId(dto.getPedidoPublicId())
                    .orElseThrow(() -> new IllegalArgumentException("El pedido especificado no existe."));
            pedidoId = pedido.getId();
            tenantId = pedido.getTenantId();
        }

        TicketSoporte ticket = new TicketSoporte(
                tenantId,
                cliente.getId(),
                pedidoId,
                dto.getAsunto(),
                dto.getPrioridad() != null ? dto.getPrioridad() : PrioridadTicket.MEDIA
        );
        ticket = ticketSoporteRepositorio.save(ticket);

        MensajeTicket mensaje = new MensajeTicket(
                ticket.getId(),
                cliente.getId(),
                dto.getMensajeInicial(),
                dto.getAdjuntoUrl()
        );
        mensajeTicketRepositorio.save(mensaje);

        return mapearTicketDto(ticket, cliente.getId(), true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketDetalleDto> listarTicketsCliente(Usuario cliente) {
        List<TicketSoporte> tickets = ticketSoporteRepositorio.findByUsuarioIdOrderByCreatedAtDesc(cliente.getId());
        return tickets.stream()
                .map(t -> mapearTicketDto(t, cliente.getId(), false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketDetalleDto obtenerTicketCliente(Usuario cliente, UUID publicId) {
        TicketSoporte ticket = ticketSoporteRepositorio.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket de soporte no encontrado."));

        if (!ticket.getUsuarioId().equals(cliente.getId())) {
            throw new AccessDeniedException("No tienes permisos para ver este ticket.");
        }

        return mapearTicketDto(ticket, cliente.getId(), true);
    }

    @Override
    public TicketDetalleDto responderTicket(Usuario usuarioActual, UUID publicId, ResponderTicketDto dto) {
        TicketSoporte ticket = ticketSoporteRepositorio.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket de soporte no encontrado."));

        boolean esCliente = usuarioActual.getRol() == RolUsuario.CLIENTE;
        boolean esEmpresa = usuarioActual.getRol() == RolUsuario.EMPRESA;
        boolean esAdmin = usuarioActual.getRol() == RolUsuario.ADMIN;

        if (esCliente && !ticket.getUsuarioId().equals(usuarioActual.getId())) {
            throw new AccessDeniedException("No tienes permisos para responder en este ticket.");
        }
        if (esEmpresa) {
            Long tenantId = obtenerTenantIdRequerido(usuarioActual);
            if (!tenantId.equals(ticket.getTenantId())) {
                throw new AccessDeniedException("Este ticket no corresponde a su distribuidora.");
            }
        }

        if (esCliente && (ticket.getEstado() == EstadoTicket.RESUELTO || ticket.getEstado() == EstadoTicket.CERRADO)) {
            ticket.setEstado(EstadoTicket.EN_PROCESO);
        } else if ((esEmpresa || esAdmin) && ticket.getEstado() == EstadoTicket.ABIERTO) {
            ticket.setEstado(EstadoTicket.EN_PROCESO);
        }
        ticketSoporteRepositorio.save(ticket);

        MensajeTicket mensaje = new MensajeTicket(
                ticket.getId(),
                usuarioActual.getId(),
                dto.getMensaje(),
                dto.getAdjuntoUrl()
        );
        mensajeTicketRepositorio.save(mensaje);

        return mapearTicketDto(ticket, usuarioActual.getId(), true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketDetalleDto> listarTicketsEmpresa(Usuario usuarioEmpresa) {
        Long tenantId = obtenerTenantIdRequerido(usuarioEmpresa);
        List<TicketSoporte> tickets = ticketSoporteRepositorio.findByTenantIdOrderByCreatedAtDesc(tenantId);
        return tickets.stream()
                .map(t -> mapearTicketDto(t, usuarioEmpresa.getId(), false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketDetalleDto obtenerTicketEmpresa(Usuario usuarioEmpresa, UUID publicId) {
        Long tenantId = obtenerTenantIdRequerido(usuarioEmpresa);
        TicketSoporte ticket = ticketSoporteRepositorio.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket de soporte no encontrado."));

        if (!tenantId.equals(ticket.getTenantId())) {
            throw new AccessDeniedException("Este ticket no corresponde a su distribuidora.");
        }

        return mapearTicketDto(ticket, usuarioEmpresa.getId(), true);
    }

    @Override
    public TicketDetalleDto actualizarEstadoEmpresa(Usuario usuarioEmpresa, UUID publicId, ActualizarEstadoTicketDto dto) {
        Long tenantId = obtenerTenantIdRequerido(usuarioEmpresa);
        TicketSoporte ticket = ticketSoporteRepositorio.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket de soporte no encontrado."));

        if (!tenantId.equals(ticket.getTenantId())) {
            throw new AccessDeniedException("Este ticket no corresponde a su distribuidora.");
        }

        ticket.setEstado(dto.getEstado());
        ticket = ticketSoporteRepositorio.save(ticket);
        return mapearTicketDto(ticket, usuarioEmpresa.getId(), true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketDetalleDto> listarTicketsAdmin() {
        return ticketSoporteRepositorio.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(t -> mapearTicketDto(t, null, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketDetalleDto obtenerTicketAdmin(UUID publicId) {
        TicketSoporte ticket = ticketSoporteRepositorio.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket de soporte no encontrado."));
        return mapearTicketDto(ticket, null, true);
    }

    @Override
    public TicketDetalleDto actualizarEstadoAdmin(UUID publicId, ActualizarEstadoTicketDto dto) {
        TicketSoporte ticket = ticketSoporteRepositorio.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket de soporte no encontrado."));
        ticket.setEstado(dto.getEstado());
        ticket = ticketSoporteRepositorio.save(ticket);
        return mapearTicketDto(ticket, null, true);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenSoporteDto obtenerMetricasEmpresa(Usuario usuarioEmpresa) {
        Long tenantId = obtenerTenantIdRequerido(usuarioEmpresa);
        long abiertos = ticketSoporteRepositorio.countByTenantIdAndEstado(tenantId, EstadoTicket.ABIERTO);
        long enProceso = ticketSoporteRepositorio.countByTenantIdAndEstado(tenantId, EstadoTicket.EN_PROCESO);
        long resueltos = ticketSoporteRepositorio.countByTenantIdAndEstado(tenantId, EstadoTicket.RESUELTO);
        long cerrados = ticketSoporteRepositorio.countByTenantIdAndEstado(tenantId, EstadoTicket.CERRADO);
        long total = ticketSoporteRepositorio.countByTenantId(tenantId);
        return new ResumenSoporteDto(abiertos, enProceso, resueltos, cerrados, total);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenSoporteDto obtenerMetricasAdmin() {
        long abiertos = ticketSoporteRepositorio.countByEstado(EstadoTicket.ABIERTO);
        long enProceso = ticketSoporteRepositorio.countByEstado(EstadoTicket.EN_PROCESO);
        long resueltos = ticketSoporteRepositorio.countByEstado(EstadoTicket.RESUELTO);
        long cerrados = ticketSoporteRepositorio.countByEstado(EstadoTicket.CERRADO);
        long total = ticketSoporteRepositorio.count();
        return new ResumenSoporteDto(abiertos, enProceso, resueltos, cerrados, total);
    }

    private TicketDetalleDto mapearTicketDto(TicketSoporte ticket, Long usuarioActualId, boolean incluirMensajes) {
        TicketDetalleDto dto = new TicketDetalleDto();
        dto.setPublicId(ticket.getPublicId());
        dto.setAsunto(ticket.getAsunto());
        dto.setEstado(ticket.getEstado());
        dto.setPrioridad(ticket.getPrioridad());
        dto.setTenantId(ticket.getTenantId());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setTotalMensajes(mensajeTicketRepositorio.countByTicketId(ticket.getId()));

        // Usuario creador
        usuarioRepositorio.findById(ticket.getUsuarioId()).ifPresent(u -> {
            dto.setUsuarioNombre(u.getNombres() + " " + u.getApellidos());
            dto.setUsuarioEmail(u.getEmail());
            dto.setUsuarioRol(u.getRol() != null ? u.getRol().name() : "");
        });

        // Empresa asociada
        if (ticket.getTenantId() != null) {
            empresaRepositorio.findById(ticket.getTenantId()).ifPresent(e -> {
                dto.setNombreEmpresa(e.getNombreComercial());
            });
        }

        // Pedido asociado
        if (ticket.getPedidoId() != null) {
            pedidoRepositorio.findById(ticket.getPedidoId()).ifPresent(p -> {
                dto.setPedidoPublicId(p.getPublicId());
            });
        }

        if (incluirMensajes) {
            List<MensajeTicket> mensajes = mensajeTicketRepositorio.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
            List<MensajeTicketDetalleDto> msgsDto = new ArrayList<>();

            for (MensajeTicket m : mensajes) {
                MensajeTicketDetalleDto mDto = new MensajeTicketDetalleDto();
                mDto.setId(m.getId());
                mDto.setMensaje(m.getMensaje());
                mDto.setAdjuntoUrl(m.getAdjuntoUrl());
                mDto.setCreatedAt(m.getCreatedAt());
                mDto.setEsMio(usuarioActualId != null && usuarioActualId.equals(m.getRemitenteId()));

                usuarioRepositorio.findById(m.getRemitenteId()).ifPresent(sender -> {
                    mDto.setRemitentePublicId(sender.getPublicId());
                    mDto.setNombreRemitente(sender.getNombres() + " " + sender.getApellidos());
                    mDto.setRolRemitente(sender.getRol() != null ? sender.getRol().name() : "");
                });

                msgsDto.add(mDto);
            }
            dto.setMensajes(msgsDto);
        }

        return dto;
    }
}
