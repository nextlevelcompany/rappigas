package com.pidegas.modulos.inventario.repositorio;

import com.pidegas.modulos.inventario.dominio.StockProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockProductoRepositorio extends JpaRepository<StockProducto, Long> {

    Optional<StockProducto> findByAlmacenIdAndProductoId(Long almacenId, Long productoId);

    List<StockProducto> findByTenantIdAndAlmacenId(Long tenantId, Long almacenId);

    List<StockProducto> findByTenantId(Long tenantId);

    @Query("SELECT s FROM StockProducto s WHERE s.tenantId = :tenantId AND s.cantidadDisponible <= s.stockMinimo")
    List<StockProducto> findStockBajo(@Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(SUM(s.cantidadDisponible), 0) FROM StockProducto s WHERE s.tenantId = :tenantId")
    Long sumCantidadDisponibleByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(SUM(s.cantidadReservada), 0) FROM StockProducto s WHERE s.tenantId = :tenantId")
    Long sumCantidadReservadaByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT COUNT(s) FROM StockProducto s WHERE s.tenantId = :tenantId AND s.cantidadDisponible <= s.stockMinimo")
    Long countStockBajoByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT COUNT(s) FROM StockProducto s WHERE s.tenantId = :tenantId AND s.cantidadDisponible = 0")
    Long countAgotadosByTenantId(@Param("tenantId") Long tenantId);
}
