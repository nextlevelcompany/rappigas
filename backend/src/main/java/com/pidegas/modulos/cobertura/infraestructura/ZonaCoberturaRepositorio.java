package com.pidegas.modulos.cobertura.infraestructura;

import com.pidegas.modulos.cobertura.dominio.ZonaCobertura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ZonaCoberturaRepositorio extends JpaRepository<ZonaCobertura, Long> {

    List<ZonaCobertura> findByTenantId(Long tenantId);

    List<ZonaCobertura> findByTenantIdAndActivaTrue(Long tenantId);

    Optional<ZonaCobertura> findByPublicIdAndTenantId(UUID publicId, Long tenantId);

    Optional<ZonaCobertura> findByPublicId(UUID publicId);

    /**
     * Consulta espacial indexada con GiST: busca todas las zonas activas pertenecientes a empresas APROBADAS
     * que cubren el punto geográfico dado (longitud, latitud) en SRID 4326.
     */
    @Query(value = """
        SELECT z.* FROM zonas_cobertura z
        INNER JOIN empresas e ON e.id = z.tenant_id
        WHERE z.activa = true
        AND e.estado = 'APROBADA'
        AND ST_Covers(z.geometria, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
        """, nativeQuery = true)
    List<ZonaCobertura> buscarZonasQueCubrenPunto(@Param("lng") Double lng, @Param("lat") Double lat);

    /**
     * Consulta espacial indexada para un tenant específico.
     */
    @Query(value = """
        SELECT z.* FROM zonas_cobertura z
        WHERE z.tenant_id = :tenantId
        AND z.activa = true
        AND ST_Covers(z.geometria, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
        """, nativeQuery = true)
    List<ZonaCobertura> buscarZonasTenantQueCubrenPunto(
            @Param("tenantId") Long tenantId,
            @Param("lng") Double lng,
            @Param("lat") Double lat
    );
}
