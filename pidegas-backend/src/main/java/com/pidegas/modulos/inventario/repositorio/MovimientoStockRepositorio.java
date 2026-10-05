package com.pidegas.modulos.inventario.repositorio;

import com.pidegas.modulos.inventario.dominio.MovimientoStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoStockRepositorio extends JpaRepository<MovimientoStock, Long> {

    Page<MovimientoStock> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    List<MovimientoStock> findByTenantIdAndAlmacenIdAndProductoIdOrderByCreatedAtDesc(Long tenantId, Long almacenId, Long productoId);

    List<MovimientoStock> findByTenantIdAndPedidoId(Long tenantId, Long pedidoId);
}
