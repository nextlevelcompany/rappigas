package com.pidegas.modulos.catalogo.repositorio;

import com.pidegas.modulos.catalogo.dominio.EstadoProducto;
import com.pidegas.modulos.catalogo.dominio.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductoRepositorio extends JpaRepository<Producto, Long> {

    List<Producto> findByTenantIdOrderByNombreAsc(Long tenantId);

    List<Producto> findByTenantIdAndEstadoOrderByNombreAsc(Long tenantId, EstadoProducto estado);

    List<Producto> findByTenantIdAndEstadoOrderByPrecioAsc(Long tenantId, EstadoProducto estado);

    Optional<Producto> findByPublicIdAndTenantId(UUID publicId, Long tenantId);

    Optional<Producto> findByPublicId(UUID publicId);

    boolean existsByTenantIdAndSku(Long tenantId, String sku);
}
