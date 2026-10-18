package com.pidegas.modulos.catalogo.aplicacion;

import com.pidegas.modulos.catalogo.dominio.EstadoProducto;
import com.pidegas.modulos.catalogo.dominio.Producto;
import com.pidegas.modulos.catalogo.dominio.TipoBalonGas;
import com.pidegas.modulos.catalogo.dominio.TipoValvulaGas;
import com.pidegas.modulos.catalogo.dto.ActualizarProductoDto;
import com.pidegas.modulos.catalogo.dto.CrearProductoDto;
import com.pidegas.modulos.catalogo.dto.ProductoDetalleDto;
import com.pidegas.modulos.catalogo.repositorio.ProductoRepositorio;
import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductoServicioTest {

    private ProductoRepositorio productoRepositorio;
    private EmpresaRepositorio empresaRepositorio;
    private ProductoServicio productoServicio;

    @BeforeEach
    void setUp() {
        productoRepositorio = Mockito.mock(ProductoRepositorio.class);
        empresaRepositorio = Mockito.mock(EmpresaRepositorio.class);
        productoServicio = new ProductoServicio(productoRepositorio, empresaRepositorio);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void crearProducto_conDatosValidos_guardaExitosamente() {
        TenantContext.setTenantId(1L);

        CrearProductoDto dto = new CrearProductoDto(
                "BALON-10KG-PREM",
                "Balón de Gas de Cocina 10kg Premium",
                "Balón doméstico con válvula Click-on de seguridad",
                TipoBalonGas.GLP_10KG,
                TipoValvulaGas.PREMIUM,
                new BigDecimal("52.00"),
                "https://ejemplo.com/balon.png"
        );

        when(productoRepositorio.existsByTenantIdAndSku(1L, "BALON-10KG-PREM")).thenReturn(false);
        when(productoRepositorio.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductoDetalleDto resultado = productoServicio.crearProducto(dto);

        assertNotNull(resultado);
        assertEquals("BALON-10KG-PREM", resultado.sku());
        assertEquals("Balón de Gas de Cocina 10kg Premium", resultado.nombre());
        assertEquals(TipoBalonGas.GLP_10KG, resultado.tipoGas());
        assertEquals(TipoValvulaGas.PREMIUM, resultado.tipoValvula());
        assertEquals(new BigDecimal("52.00"), resultado.precio());
        assertEquals(EstadoProducto.ACTIVO, resultado.estado());
        verify(productoRepositorio, times(1)).save(any(Producto.class));
    }

    @Test
    void crearProducto_skuDuplicado_lanzaIllegalArgumentException() {
        TenantContext.setTenantId(1L);

        CrearProductoDto dto = new CrearProductoDto(
                "BALON-10KG-PREM",
                "Balón de Gas",
                "Desc",
                TipoBalonGas.GLP_10KG,
                TipoValvulaGas.PREMIUM,
                new BigDecimal("50.00"),
                null
        );

        when(productoRepositorio.existsByTenantIdAndSku(1L, "BALON-10KG-PREM")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> productoServicio.crearProducto(dto));
        verify(productoRepositorio, never()).save(any(Producto.class));
    }

    @Test
    void crearProducto_sinTenant_lanzaAccessDeniedException() {
        TenantContext.clear();

        CrearProductoDto dto = new CrearProductoDto(
                "SKU-1", "Nombre", null, TipoBalonGas.GLP_10KG, TipoValvulaGas.PREMIUM, new BigDecimal("50.00"), null
        );

        assertThrows(AccessDeniedException.class, () -> productoServicio.crearProducto(dto));
    }

    @Test
    void actualizarProducto_modificaPrecioYValvula() {
        TenantContext.setTenantId(1L);
        UUID publicId = UUID.randomUUID();

        Producto producto = new Producto(
                1L, "SKU-1", "Balón Original", "Desc",
                TipoBalonGas.GLP_10KG, TipoValvulaGas.ROSCA, new BigDecimal("48.00"), null
        );

        when(productoRepositorio.findByPublicIdAndTenantId(publicId, 1L)).thenReturn(Optional.of(producto));
        when(productoRepositorio.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        ActualizarProductoDto actualizacion = new ActualizarProductoDto(
                "Balón de Gas de Cocina 10kg Actualizado",
                "Nueva descripción",
                TipoBalonGas.GLP_10KG,
                TipoValvulaGas.PREMIUM,
                new BigDecimal("53.50"),
                null,
                EstadoProducto.ACTIVO
        );

        ProductoDetalleDto resultado = productoServicio.actualizarProducto(publicId, actualizacion);

        assertNotNull(resultado);
        assertEquals("Balón de Gas de Cocina 10kg Actualizado", resultado.nombre());
        assertEquals(TipoValvulaGas.PREMIUM, resultado.tipoValvula());
        assertEquals(new BigDecimal("53.50"), resultado.precio());
    }

    @Test
    void eliminarProducto_cambiaEstadoAInactivo() {
        TenantContext.setTenantId(1L);
        UUID publicId = UUID.randomUUID();

        Producto producto = new Producto(
                1L, "SKU-1", "Balón Activo", null,
                TipoBalonGas.GLP_10KG, TipoValvulaGas.PREMIUM, new BigDecimal("50.00"), null
        );

        when(productoRepositorio.findByPublicIdAndTenantId(publicId, 1L)).thenReturn(Optional.of(producto));
        when(productoRepositorio.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        productoServicio.eliminarProducto(publicId);

        assertEquals(EstadoProducto.INACTIVO, producto.getEstado());
        verify(productoRepositorio, times(1)).save(producto);
    }

    @Test
    void listarProductosPorEmpresaPublica_retornaSoloActivosDeEmpresaAprobada() {
        UUID empresaPublicId = UUID.randomUUID();
        Empresa empresa = new Empresa();
        empresa.setEstado(EstadoEmpresa.APROBADA);

        Producto p1 = new Producto(
                1L, "SKU-1", "Balón 10kg", null,
                TipoBalonGas.GLP_10KG, TipoValvulaGas.PREMIUM, new BigDecimal("50.00"), null
        );

        when(empresaRepositorio.findByPublicId(empresaPublicId)).thenReturn(Optional.of(empresa));
        when(productoRepositorio.findByTenantIdAndEstadoOrderByPrecioAsc(any(), eq(EstadoProducto.ACTIVO)))
                .thenReturn(List.of(p1));

        List<ProductoDetalleDto> resultado = productoServicio.listarProductosPorEmpresaPublica(empresaPublicId);

        assertEquals(1, resultado.size());
        assertEquals("Balón 10kg", resultado.get(0).nombre());
    }
}
