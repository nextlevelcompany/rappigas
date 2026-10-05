package com.pidegas.modulos.analytics.aplicacion;

import com.pidegas.modulos.analytics.dto.DashboardAdminDto;
import com.pidegas.modulos.analytics.dto.DashboardEmpresaDto;
import com.pidegas.modulos.analytics.dto.VentaProductoDto;
import com.pidegas.modulos.analytics.dto.VentasDiaDto;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.flota.dominio.EstadoRepartidor;
import com.pidegas.modulos.flota.repositorio.RepartidorRepositorio;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.inventario.repositorio.StockProductoRepositorio;
import com.pidegas.modulos.pedidos.dominio.DetallePedido;
import com.pidegas.modulos.pedidos.dominio.EstadoPedido;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.modulos.pedidos.repositorio.PedidoRepositorio;
import com.pidegas.modulos.soporte.dominio.EstadoTicket;
import com.pidegas.modulos.soporte.repositorio.TicketSoporteRepositorio;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsServicioImpl implements AnalyticsServicio {

    private final PedidoRepositorio pedidoRepositorio;
    private final StockProductoRepositorio stockProductoRepositorio;
    private final RepartidorRepositorio repartidorRepositorio;
    private final EmpresaRepositorio empresaRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final TicketSoporteRepositorio ticketSoporteRepositorio;

    private static final DateTimeFormatter DIA_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public AnalyticsServicioImpl(
            PedidoRepositorio pedidoRepositorio,
            StockProductoRepositorio stockProductoRepositorio,
            RepartidorRepositorio repartidorRepositorio,
            EmpresaRepositorio empresaRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            TicketSoporteRepositorio ticketSoporteRepositorio) {
        this.pedidoRepositorio = pedidoRepositorio;
        this.stockProductoRepositorio = stockProductoRepositorio;
        this.repartidorRepositorio = repartidorRepositorio;
        this.empresaRepositorio = empresaRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.ticketSoporteRepositorio = ticketSoporteRepositorio;
    }

    @Override
    public DashboardEmpresaDto obtenerDashboardEmpresa(Long tenantId) {
        DashboardEmpresaDto dto = new DashboardEmpresaDto();

        OffsetDateTime ahora = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime inicioHoy = ahora.toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime inicioMes = ahora.toLocalDate().withDayOfMonth(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        List<Pedido> pedidosTenantConDetalles = pedidoRepositorio.findByTenantIdWithDetalles(tenantId);

        // Ventas hoy
        BigDecimal ventasHoy = pedidosTenantConDetalles.stream()
                .filter(p -> p.getCreatedAt().isAfter(inicioHoy) || p.getCreatedAt().isEqual(inicioHoy))
                .filter(p -> p.getEstado() == EstadoPedido.ENTREGADO)
                .map(Pedido::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setVentasHoy(ventasHoy);

        // Ventas mes y pedidos mes
        List<Pedido> pedidosMes = pedidosTenantConDetalles.stream()
                .filter(p -> p.getCreatedAt().isAfter(inicioMes) || p.getCreatedAt().isEqual(inicioMes))
                .toList();

        dto.setTotalPedidosMes(pedidosMes.size());

        BigDecimal ventasMes = pedidosMes.stream()
                .filter(p -> p.getEstado() == EstadoPedido.ENTREGADO)
                .map(Pedido::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setVentasMes(ventasMes);

        long entregadosMes = pedidosMes.stream()
                .filter(p -> p.getEstado() == EstadoPedido.ENTREGADO)
                .count();

        if (entregadosMes > 0 && ventasMes.compareTo(BigDecimal.ZERO) > 0) {
            dto.setTicketPromedio(ventasMes.divide(BigDecimal.valueOf(entregadosMes), 2, RoundingMode.HALF_UP));
        } else {
            dto.setTicketPromedio(BigDecimal.ZERO);
        }

        // Conteo por estados
        dto.setPedidosPendientes(pedidoRepositorio.countByTenantIdAndEstado(tenantId, EstadoPedido.PENDIENTE));
        long asignados = pedidoRepositorio.countByTenantIdAndEstado(tenantId, EstadoPedido.ASIGNADO);
        long enCamino = pedidoRepositorio.countByTenantIdAndEstado(tenantId, EstadoPedido.EN_CAMINO);
        dto.setPedidosEnCamino(asignados + enCamino);
        dto.setPedidosEntregados(pedidoRepositorio.countByTenantIdAndEstado(tenantId, EstadoPedido.ENTREGADO));

        // Inventario y flota
        Long stockBajo = stockProductoRepositorio.countStockBajoByTenantId(tenantId);
        dto.setBalonesStockBajo(stockBajo != null ? stockBajo : 0L);

        Long agotados = stockProductoRepositorio.countAgotadosByTenantId(tenantId);
        dto.setProductosAgotados(agotados != null ? agotados : 0L);

        long disponibles = repartidorRepositorio.countByTenantIdAndEstado(tenantId, EstadoRepartidor.DISPONIBLE);
        long enRuta = repartidorRepositorio.countByTenantIdAndEstado(tenantId, EstadoRepartidor.EN_RUTA);
        dto.setRepartidoresActivos(disponibles + enRuta);

        // Ventas por día (últimos 7 días)
        LocalDate hoy = ahora.toLocalDate();
        List<VentasDiaDto> ventasPorDia = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate dia = hoy.minusDays(i);
            String diaStr = dia.format(DIA_FORMATTER);

            List<Pedido> pedidosDelDia = pedidosTenantConDetalles.stream()
                    .filter(p -> p.getCreatedAt().toLocalDate().isEqual(dia))
                    .toList();

            BigDecimal montoDia = pedidosDelDia.stream()
                    .filter(p -> p.getEstado() == EstadoPedido.ENTREGADO)
                    .map(Pedido::getTotal)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            ventasPorDia.add(new VentasDiaDto(diaStr, montoDia, pedidosDelDia.size()));
        }
        dto.setVentasPorDia(ventasPorDia);

        // Distribución por método de pago
        Map<String, Long> porMetodoPago = pedidosTenantConDetalles.stream()
                .collect(Collectors.groupingBy(p -> p.getMetodoPago().name(), Collectors.counting()));
        dto.setPedidosPorMetodoPago(porMetodoPago);

        // Ventas por producto (balones de gas de cocina)
        Map<String, DetalleAcumulador> acumuladorPorProducto = new HashMap<>();
        for (Pedido pedido : pedidosTenantConDetalles) {
            if (pedido.getEstado() == EstadoPedido.ENTREGADO || pedido.getEstado() == EstadoPedido.EN_CAMINO || pedido.getEstado() == EstadoPedido.ASIGNADO) {
                for (DetallePedido det : pedido.getDetalles()) {
                    if (det.getProducto() != null) {
                        String sku = det.getProducto().getSku();
                        String nombre = det.getProducto().getNombre();
                        acumuladorPorProducto.computeIfAbsent(sku, k -> new DetalleAcumulador(nombre, sku))
                                .agregar(det.getCantidad(), det.getSubtotal());
                    }
                }
            }
        }

        List<VentaProductoDto> ventasPorProducto = acumuladorPorProducto.values().stream()
                .map(a -> new VentaProductoDto(a.nombre, a.sku, a.cantidad, a.total))
                .sorted((a, b) -> b.getTotalVentas().compareTo(a.getTotalVentas()))
                .limit(10)
                .toList();
        dto.setVentasPorProducto(ventasPorProducto);

        return dto;
    }

    @Override
    public DashboardAdminDto obtenerDashboardAdmin() {
        DashboardAdminDto dto = new DashboardAdminDto();

        List<Pedido> todosLosPedidos = pedidoRepositorio.findAllWithDetalles();

        BigDecimal volumenTotal = todosLosPedidos.stream()
                .filter(p -> p.getEstado() == EstadoPedido.ENTREGADO)
                .map(Pedido::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setVolumenTransaccionadoTotal(volumenTotal);

        // 5% de comisión estándar sobre el volumen bruto transaccionado
        BigDecimal comisiones = volumenTotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        dto.setComisionesTotalesPlataforma(comisiones);

        dto.setTotalEmpresas(empresaRepositorio.count());
        dto.setEmpresasAprobadas(empresaRepositorio.countByEstado(EstadoEmpresa.APROBADA));
        dto.setEmpresasPendientes(empresaRepositorio.countByEstado(EstadoEmpresa.PENDIENTE));

        dto.setTotalClientes(usuarioRepositorio.countByRol(RolUsuario.CLIENTE));
        dto.setTotalRepartidores(repartidorRepositorio.count());
        dto.setTotalPedidosGlobal(todosLosPedidos.size());

        long pedidosEntregados = todosLosPedidos.stream()
                .filter(p -> p.getEstado() == EstadoPedido.ENTREGADO)
                .count();

        long pedidosNoCancelados = todosLosPedidos.stream()
                .filter(p -> p.getEstado() != EstadoPedido.CANCELADO)
                .count();

        if (pedidosNoCancelados > 0) {
            double tasa = (double) pedidosEntregados * 100.0 / (double) pedidosNoCancelados;
            dto.setTasaEntregaExitosa(Math.round(tasa * 10.0) / 10.0);
        } else {
            dto.setTasaEntregaExitosa(100.0);
        }

        long abiertos = ticketSoporteRepositorio.countByEstado(EstadoTicket.ABIERTO);
        long enProceso = ticketSoporteRepositorio.countByEstado(EstadoTicket.EN_PROCESO);
        dto.setTicketsAbiertos(abiertos + enProceso);

        // Ventas globales por día (últimos 7 días)
        LocalDate hoy = LocalDate.now(ZoneOffset.UTC);
        List<VentasDiaDto> ventasGlobales = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate dia = hoy.minusDays(i);
            String diaStr = dia.format(DIA_FORMATTER);

            List<Pedido> pedidosDia = todosLosPedidos.stream()
                    .filter(p -> p.getCreatedAt().toLocalDate().isEqual(dia))
                    .toList();

            BigDecimal montoDia = pedidosDia.stream()
                    .filter(p -> p.getEstado() == EstadoPedido.ENTREGADO)
                    .map(Pedido::getTotal)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            ventasGlobales.add(new VentasDiaDto(diaStr, montoDia, pedidosDia.size()));
        }
        dto.setVentasPorDiaGlobal(ventasGlobales);

        // Distribución por método de pago global
        Map<String, Long> porMetodoPago = todosLosPedidos.stream()
                .collect(Collectors.groupingBy(p -> p.getMetodoPago().name(), Collectors.counting()));
        dto.setDistribucionPorMetodoPago(porMetodoPago);

        return dto;
    }

    private static class DetalleAcumulador {
        String nombre;
        String sku;
        long cantidad = 0;
        BigDecimal total = BigDecimal.ZERO;

        DetalleAcumulador(String nombre, String sku) {
            this.nombre = nombre;
            this.sku = sku;
        }

        void agregar(int cant, BigDecimal subtotal) {
            this.cantidad += cant;
            if (subtotal != null) {
                this.total = this.total.add(subtotal);
            }
        }
    }
}
