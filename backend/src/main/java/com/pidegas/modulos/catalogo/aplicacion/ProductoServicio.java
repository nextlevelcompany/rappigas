package com.pidegas.modulos.catalogo.aplicacion;

import com.pidegas.modulos.catalogo.dominio.EstadoProducto;
import com.pidegas.modulos.catalogo.dominio.Producto;
import com.pidegas.modulos.catalogo.dto.ActualizarProductoDto;
import com.pidegas.modulos.catalogo.dto.CrearProductoDto;
import com.pidegas.modulos.catalogo.dto.ProductoDetalleDto;
import com.pidegas.modulos.catalogo.repositorio.ProductoRepositorio;
import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProductoServicio {

    private final ProductoRepositorio productoRepositorio;
    private final EmpresaRepositorio empresaRepositorio;

    public ProductoServicio(ProductoRepositorio productoRepositorio, EmpresaRepositorio empresaRepositorio) {
        this.productoRepositorio = productoRepositorio;
        this.empresaRepositorio = empresaRepositorio;
    }

    @Transactional(readOnly = true)
    public List<ProductoDetalleDto> listarMisProductos(EstadoProducto estado) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        List<Producto> productos = (estado != null)
                ? productoRepositorio.findByTenantIdAndEstadoOrderByNombreAsc(tenantId, estado)
                : productoRepositorio.findByTenantIdOrderByNombreAsc(tenantId);

        return productos.stream().map(this::mapearADetalleDto).toList();
    }

    @Transactional(readOnly = true)
    public ProductoDetalleDto obtenerMiProducto(UUID publicId) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        Producto producto = productoRepositorio.findByPublicIdAndTenantId(publicId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado o no pertenece a su distribuidora."));

        return mapearADetalleDto(producto);
    }

    public ProductoDetalleDto crearProducto(CrearProductoDto dto) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        String skuNormalizado = dto.sku().trim().toUpperCase();
        if (productoRepositorio.existsByTenantIdAndSku(tenantId, skuNormalizado)) {
            throw new IllegalArgumentException("Ya existe un producto con el código SKU " + skuNormalizado + " para su distribuidora.");
        }

        Producto producto = new Producto(
                tenantId,
                skuNormalizado,
                dto.nombre().trim(),
                dto.descripcion(),
                dto.tipoGas(),
                dto.tipoValvula(),
                dto.precio(),
                dto.imagenUrl()
        );

        producto = productoRepositorio.save(producto);
        return mapearADetalleDto(producto);
    }

    public ProductoDetalleDto actualizarProducto(UUID publicId, ActualizarProductoDto dto) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        Producto producto = productoRepositorio.findByPublicIdAndTenantId(publicId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado o no pertenece a su distribuidora."));

        if (dto.nombre() != null && !dto.nombre().isBlank()) {
            producto.setNombre(dto.nombre().trim());
        }
        if (dto.descripcion() != null) {
            producto.setDescripcion(dto.descripcion());
        }
        if (dto.tipoGas() != null) {
            producto.setTipoGas(dto.tipoGas());
        }
        if (dto.tipoValvula() != null) {
            producto.setTipoValvula(dto.tipoValvula());
        }
        if (dto.precio() != null) {
            producto.setPrecio(dto.precio());
        }
        if (dto.imagenUrl() != null) {
            producto.setImagenUrl(dto.imagenUrl());
        }
        if (dto.estado() != null) {
            producto.setEstado(dto.estado());
        }

        producto = productoRepositorio.save(producto);
        return mapearADetalleDto(producto);
    }

    public void eliminarProducto(UUID publicId) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        Producto producto = productoRepositorio.findByPublicIdAndTenantId(publicId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado o no pertenece a su distribuidora."));

        // Desactivación lógica
        producto.setEstado(EstadoProducto.INACTIVO);
        productoRepositorio.save(producto);
    }

    @Transactional(readOnly = true)
    public List<ProductoDetalleDto> listarProductosPorEmpresaPublica(UUID empresaPublicId) {
        Empresa empresa = empresaRepositorio.findByPublicId(empresaPublicId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la empresa solicitada."));

        if (empresa.getEstado() != EstadoEmpresa.APROBADA) {
            throw new IllegalArgumentException("La empresa no se encuentra activa en el catálogo público.");
        }

        return productoRepositorio.findByTenantIdAndEstadoOrderByPrecioAsc(empresa.getId(), EstadoProducto.ACTIVO)
                .stream()
                .map(this::mapearADetalleDto)
                .toList();
    }

    private ProductoDetalleDto mapearADetalleDto(Producto p) {
        return new ProductoDetalleDto(
                p.getId(),
                p.getPublicId(),
                p.getTenantId(),
                p.getSku(),
                p.getNombre(),
                p.getDescripcion(),
                p.getTipoGas(),
                p.getTipoGas() != null ? p.getTipoGas().getDescripcion() : null,
                p.getTipoValvula(),
                p.getTipoValvula() != null ? p.getTipoValvula().getDescripcion() : null,
                p.getPrecio(),
                p.getImagenUrl(),
                p.getEstado(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
