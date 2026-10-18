package com.pidegas.modulos.flota.aplicacion;

import com.pidegas.modulos.flota.dominio.*;
import com.pidegas.modulos.flota.dto.*;
import com.pidegas.modulos.flota.repositorio.RepartidorRepositorio;
import com.pidegas.modulos.flota.repositorio.VehiculoRepositorio;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import com.pidegas.nucleo.websocket.NotificacionWebSocketServicio;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FlotaServicio {

    private final VehiculoRepositorio vehiculoRepositorio;
    private final RepartidorRepositorio repartidorRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final NotificacionWebSocketServicio notificacionWebSocketServicio;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public FlotaServicio(
            VehiculoRepositorio vehiculoRepositorio,
            RepartidorRepositorio repartidorRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            NotificacionWebSocketServicio notificacionWebSocketServicio
    ) {
        this.vehiculoRepositorio = vehiculoRepositorio;
        this.repartidorRepositorio = repartidorRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.notificacionWebSocketServicio = notificacionWebSocketServicio;
    }

    @Transactional(readOnly = true)
    public List<VehiculoDetalleDto> listarVehiculos() {
        Long tenantId = obtenerTenantIdRequerido();
        return vehiculoRepositorio.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::mapearAVehiculoDto)
                .toList();
    }

    public VehiculoDetalleDto crearVehiculo(CrearVehiculoDto dto) {
        Long tenantId = obtenerTenantIdRequerido();
        if (vehiculoRepositorio.existsByTenantIdAndPlaca(tenantId, dto.placa())) {
            throw new IllegalArgumentException("Ya existe un vehículo registrado con la placa '" + dto.placa() + "' en su distribuidora.");
        }

        Vehiculo vehiculo = new Vehiculo(
                tenantId,
                dto.placa().toUpperCase().trim(),
                dto.marca(),
                dto.modelo(),
                dto.tipoVehiculo(),
                dto.capacidadBalones()
        );

        Vehiculo guardado = vehiculoRepositorio.save(vehiculo);
        return mapearAVehiculoDto(guardado);
    }

    @Transactional(readOnly = true)
    public List<RepartidorDetalleDto> listarRepartidores() {
        Long tenantId = obtenerTenantIdRequerido();
        return repartidorRepositorio.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::mapearARepartidorDto)
                .toList();
    }

    public RepartidorDetalleDto registrarRepartidor(RegistrarRepartidorDto dto) {
        Long tenantId = obtenerTenantIdRequerido();
        Usuario usuario = usuarioRepositorio.findByEmail(dto.email())
                .orElseThrow(() -> new IllegalArgumentException("No existe ningún usuario registrado con el email '" + dto.email() + "'."));

        if (usuario.getRol() != RolUsuario.REPARTIDOR) {
            throw new IllegalArgumentException("El usuario con email '" + dto.email() + "' no cuenta con el rol REPARTIDOR.");
        }

        if (repartidorRepositorio.existsByTenantIdAndUsuarioId(tenantId, usuario.getId())) {
            throw new IllegalArgumentException("El repartidor ya se encuentra afiliado a esta distribuidora.");
        }

        Long vehiculoId = null;
        if (dto.vehiculoPublicId() != null) {
            Vehiculo vehiculo = vehiculoRepositorio.findByPublicIdAndTenantId(dto.vehiculoPublicId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("El vehículo especificado no existe o no pertenece a su distribuidora."));
            vehiculoId = vehiculo.getId();
        }

        Repartidor repartidor = new Repartidor(tenantId, usuario.getId(), vehiculoId, dto.licenciaConducir());
        Repartidor guardado = repartidorRepositorio.save(repartidor);

        return mapearARepartidorDto(guardado);
    }

    public void actualizarUbicacionGps(ActualizarUbicacionGpsDto dto, String emailRepartidor) {
        Usuario usuario = usuarioRepositorio.findByEmail(emailRepartidor)
                .orElseThrow(() -> new AccessDeniedException("Usuario repartidor no encontrado."));

        Repartidor repartidor = repartidorRepositorio.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException("Perfil de repartidor no encontrado."));

        Point coordenada = geometryFactory.createPoint(new Coordinate(dto.longitud(), dto.latitud()));
        coordenada.setSRID(4326);

        repartidor.setUltimaCoordenada(coordenada);
        repartidor.setUltimaActualizacionGps(OffsetDateTime.now());
        repartidorRepositorio.save(repartidor);

        EventoGpsWebSocketDto evento = new EventoGpsWebSocketDto(
                repartidor.getPublicId(),
                dto.pedidoPublicId(),
                dto.latitud(),
                dto.longitud(),
                OffsetDateTime.now()
        );

        notificacionWebSocketServicio.notificarUbicacionGps(repartidor.getTenantId(), evento);
    }

    private Long obtenerTenantIdRequerido() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de distribuidora (tenant).");
        }
        return tenantId;
    }

    private VehiculoDetalleDto mapearAVehiculoDto(Vehiculo v) {
        return new VehiculoDetalleDto(
                v.getPublicId(),
                v.getTenantId(),
                v.getPlaca(),
                v.getMarca(),
                v.getModelo(),
                v.getTipoVehiculo(),
                v.getCapacidadBalones(),
                v.getEstado(),
                v.getCreatedAt()
        );
    }

    private RepartidorDetalleDto mapearARepartidorDto(Repartidor r) {
        Usuario u = usuarioRepositorio.findById(r.getUsuarioId()).orElse(null);
        Vehiculo v = r.getVehiculoId() != null ? vehiculoRepositorio.findById(r.getVehiculoId()).orElse(null) : null;

        return new RepartidorDetalleDto(
                r.getPublicId(),
                r.getTenantId(),
                u != null ? u.getPublicId() : null,
                u != null ? u.getNombres() : "Repartidor",
                u != null ? u.getApellidos() : "",
                u != null ? u.getEmail() : null,
                u != null ? u.getTelefono() : null,
                r.getLicenciaConducir(),
                v != null ? v.getPublicId() : null,
                v != null ? v.getPlaca() : null,
                v != null ? v.getTipoVehiculo() : null,
                r.getEstado(),
                r.getUltimaCoordenada() != null ? r.getUltimaCoordenada().getY() : null,
                r.getUltimaCoordenada() != null ? r.getUltimaCoordenada().getX() : null,
                r.getUltimaActualizacionGps(),
                r.getCreatedAt()
        );
    }
}
