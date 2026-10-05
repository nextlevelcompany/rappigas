package com.pidegas.modulos.cobertura.aplicacion;

import com.pidegas.modulos.cobertura.dominio.ZonaCobertura;
import com.pidegas.modulos.cobertura.dto.*;
import com.pidegas.modulos.cobertura.infraestructura.ZonaCoberturaRepositorio;
import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.dto.EmpresaDetalleDto;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.locationtech.jts.geom.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class ZonaCoberturaServicio {

    private final ZonaCoberturaRepositorio zonaCoberturaRepositorio;
    private final EmpresaRepositorio empresaRepositorio;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public ZonaCoberturaServicio(
            ZonaCoberturaRepositorio zonaCoberturaRepositorio,
            EmpresaRepositorio empresaRepositorio
    ) {
        this.zonaCoberturaRepositorio = zonaCoberturaRepositorio;
        this.empresaRepositorio = empresaRepositorio;
    }

    @Transactional(readOnly = true)
    public List<ZonaCoberturaDetalleDto> listarMisZonas() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }
        return zonaCoberturaRepositorio.findByTenantId(tenantId)
                .stream()
                .map(this::mapearADetalleDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ZonaCoberturaDetalleDto obtenerMiZona(UUID publicId) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }
        ZonaCobertura zona = zonaCoberturaRepositorio.findByPublicIdAndTenantId(publicId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Zona de cobertura no encontrada o no pertenece a su distribuidora."));
        return mapearADetalleDto(zona);
    }

    public ZonaCoberturaDetalleDto crearZona(CrearZonaCoberturaDto dto) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        Polygon poligono = construirPoligono(dto.coordenadas());
        ZonaCobertura zona = new ZonaCobertura(tenantId, dto.nombre().trim(), poligono);
        zona = zonaCoberturaRepositorio.save(zona);

        return mapearADetalleDto(zona);
    }

    public ZonaCoberturaDetalleDto actualizarZona(UUID publicId, ActualizarZonaCoberturaDto dto) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        ZonaCobertura zona = zonaCoberturaRepositorio.findByPublicIdAndTenantId(publicId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Zona de cobertura no encontrada o no pertenece a su distribuidora."));

        if (dto.nombre() != null && !dto.nombre().isBlank()) {
            zona.setNombre(dto.nombre().trim());
        }
        if (dto.activa() != null) {
            zona.setActiva(dto.activa());
        }
        if (dto.coordenadas() != null && !dto.coordenadas().isEmpty()) {
            Polygon poligono = construirPoligono(dto.coordenadas());
            zona.setGeometria(poligono);
        }

        zona = zonaCoberturaRepositorio.save(zona);
        return mapearADetalleDto(zona);
    }

    public void eliminarZona(UUID publicId) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        ZonaCobertura zona = zonaCoberturaRepositorio.findByPublicIdAndTenantId(publicId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Zona de cobertura no encontrada o no pertenece a su distribuidora."));

        // Desactivación lógica (soft delete)
        zona.setActiva(false);
        zonaCoberturaRepositorio.save(zona);
    }

    @Transactional(readOnly = true)
    public RespuestaVerificarCoberturaDto verificarCobertura(VerificarCoberturaDto dto) {
        List<ZonaCobertura> zonas = zonaCoberturaRepositorio.buscarZonasQueCubrenPunto(dto.lng(), dto.lat());

        if (zonas.isEmpty()) {
            return new RespuestaVerificarCoberturaDto(
                    false,
                    dto.lat(),
                    dto.lng(),
                    0,
                    List.of()
            );
        }

        // Obtener los IDs de empresa únicos
        Set<Long> tenantIds = new HashSet<>();
        for (ZonaCobertura z : zonas) {
            tenantIds.add(z.getTenantId());
        }

        List<EmpresaDetalleDto> distribuidoras = empresaRepositorio.findAllById(tenantIds)
                .stream()
                .map(this::mapearEmpresaADto)
                .toList();

        return new RespuestaVerificarCoberturaDto(
                true,
                dto.lat(),
                dto.lng(),
                distribuidoras.size(),
                distribuidoras
        );
    }

    public Polygon construirPoligono(List<List<Double>> coords) {
        if (coords == null || coords.size() < 4) {
            throw new IllegalArgumentException("Un polígono requiere al menos 4 puntos donde el primero y último coincidan.");
        }

        Coordinate[] jtsCoords = new Coordinate[coords.size()];
        for (int i = 0; i < coords.size(); i++) {
            List<Double> pt = coords.get(i);
            if (pt.size() < 2) {
                throw new IllegalArgumentException("Cada coordenada debe contener al menos [longitud, latitud].");
            }
            jtsCoords[i] = new Coordinate(pt.get(0), pt.get(1));
        }

        // Asegurar que el anillo lineal esté cerrado
        if (!jtsCoords[0].equals2D(jtsCoords[jtsCoords.length - 1])) {
            Coordinate[] closedCoords = Arrays.copyOf(jtsCoords, jtsCoords.length + 1);
            closedCoords[closedCoords.length - 1] = new Coordinate(jtsCoords[0]);
            jtsCoords = closedCoords;
        }

        LinearRing ring = geometryFactory.createLinearRing(jtsCoords);
        Polygon polygon = geometryFactory.createPolygon(ring);
        polygon.setSRID(4326);
        return polygon;
    }

    public List<List<Double>> convertirACoordenadas(Polygon polygon) {
        if (polygon == null) return List.of();
        return Arrays.stream(polygon.getCoordinates())
                .map(c -> List.of(c.getX(), c.getY()))
                .toList();
    }

    private ZonaCoberturaDetalleDto mapearADetalleDto(ZonaCobertura z) {
        return new ZonaCoberturaDetalleDto(
                z.getId(),
                z.getPublicId(),
                z.getTenantId(),
                z.getNombre(),
                z.getActiva(),
                convertirACoordenadas(z.getGeometria()),
                z.getCreatedAt(),
                z.getUpdatedAt()
        );
    }

    private EmpresaDetalleDto mapearEmpresaADto(Empresa empresa) {
        return new EmpresaDetalleDto(
                empresa.getPublicId(),
                empresa.getRuc(),
                empresa.getNombreComercial(),
                empresa.getRazonSocial(),
                empresa.getTelefono(),
                empresa.getEmailContacto(),
                empresa.getDireccionFiscal(),
                empresa.getLogoUrl(),
                empresa.getEstado(),
                empresa.getCreatedAt()
        );
    }
}
