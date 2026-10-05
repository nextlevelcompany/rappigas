package com.pidegas.modulos.inventario.repositorio;

import com.pidegas.modulos.inventario.dominio.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlmacenRepositorio extends JpaRepository<Almacen, Long> {

    List<Almacen> findByTenantIdAndActivoTrueOrderByNombreAsc(Long tenantId);

    List<Almacen> findByTenantIdOrderByNombreAsc(Long tenantId);

    Optional<Almacen> findByPublicIdAndTenantId(UUID publicId, Long tenantId);

    Optional<Almacen> findFirstByTenantIdAndActivoTrue(Long tenantId);

    boolean existsByTenantIdAndNombreIgnoreCase(Long tenantId, String nombre);

    long countByTenantIdAndActivoTrue(Long tenantId);
}
