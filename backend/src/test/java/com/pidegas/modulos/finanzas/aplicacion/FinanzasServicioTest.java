package com.pidegas.modulos.finanzas.aplicacion;

import com.pidegas.modulos.finanzas.dominio.*;
import com.pidegas.modulos.finanzas.dto.*;
import com.pidegas.modulos.finanzas.pasarela.*;
import com.pidegas.modulos.finanzas.repositorio.*;
import com.pidegas.modulos.finanzas.sunat.FacturadorElectronico;
import com.pidegas.modulos.finanzas.sunat.ResultadoEmisionComprobante;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.pedidos.dominio.*;
import com.pidegas.modulos.pedidos.repositorio.PedidoRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FinanzasServicioTest {

    private PagoRepositorio pagoRepositorio;
    private ComisionRepositorio comisionRepositorio;
    private LiquidacionRepositorio liquidacionRepositorio;
    private PedidoRepositorio pedidoRepositorio;
    private UsuarioRepositorio usuarioRepositorio;
    private PasarelaPagos pasarelaPagos;
    private FacturadorElectronico facturadorElectronico;

    private FinanzasServicio finanzasServicio;

    private final Long TENANT_ID = 1L;
    private final Long CLIENTE_ID = 10L;

    @BeforeEach
    void setUp() {
        pagoRepositorio = mock(PagoRepositorio.class);
        comisionRepositorio = mock(ComisionRepositorio.class);
        liquidacionRepositorio = mock(LiquidacionRepositorio.class);
        pedidoRepositorio = mock(PedidoRepositorio.class);
        usuarioRepositorio = mock(UsuarioRepositorio.class);
        pasarelaPagos = new PasarelaPagosSimuladaImpl();
        facturadorElectronico = mock(FacturadorElectronico.class);

        finanzasServicio = new FinanzasServicioImpl(
                pagoRepositorio,
                comisionRepositorio,
                liquidacionRepositorio,
                pedidoRepositorio,
                usuarioRepositorio,
                pasarelaPagos,
                facturadorElectronico
        );

        when(facturadorElectronico.emitirComprobante(any()))
                .thenReturn(ResultadoEmisionComprobante.exitoso("B001-00000001", "HASH123", "http://pdf.com"));
        when(pagoRepositorio.save(any(Pago.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void procesarPagoPedido_conYape_exitoso_apruebaPago_y_generaComision() {
        UUID pedidoPublicId = UUID.randomUUID();
        Pedido pedido = new Pedido(
                TENANT_ID,
                CLIENTE_ID,
                new BigDecimal("104.00"),
                BigDecimal.ZERO,
                new BigDecimal("104.00"),
                MetodoPago.YAPE,
                "Av. Antunez 123",
                "Frente parque",
                null,
                "",
                "123456"
        );
        ReflectionTestUtils.setField(pedido, "id", 50L);
        ReflectionTestUtils.setField(pedido, "publicId", pedidoPublicId);

        when(pedidoRepositorio.findByPublicId(pedidoPublicId)).thenReturn(Optional.of(pedido));
        when(usuarioRepositorio.findById(CLIENTE_ID)).thenReturn(Optional.empty());
        when(comisionRepositorio.existsByPedidoId(50L)).thenReturn(false);

        ProcesarPagoDto dto = new ProcesarPagoDto(
                pedidoPublicId,
                MetodoPago.YAPE,
                "987654321",
                null,
                "Juan Perez"
        );

        ResultadoProcesamientoPago resultado = finanzasServicio.procesarPagoPedido(dto, CLIENTE_ID);

        assertTrue(resultado.exitoso());
        assertEquals(EstadoPago.PAGADO, pedido.getEstadoPago());
        assertEquals(MetodoPago.YAPE, pedido.getMetodoPago());
        verify(pagoRepositorio, times(1)).save(any(Pago.class));
        verify(comisionRepositorio, times(1)).save(any(Comision.class));
    }

    @Test
    void procesarPagoPedido_conTarjetaRechazada_registraPagoRechazado() {
        UUID pedidoPublicId = UUID.randomUUID();
        Pedido pedido = new Pedido(
                TENANT_ID,
                CLIENTE_ID,
                new BigDecimal("52.00"),
                BigDecimal.ZERO,
                new BigDecimal("52.00"),
                MetodoPago.TARJETA,
                "Av. Antunez 123",
                "",
                null,
                "",
                "654321"
        );
        ReflectionTestUtils.setField(pedido, "id", 60L);
        ReflectionTestUtils.setField(pedido, "publicId", pedidoPublicId);

        when(pedidoRepositorio.findByPublicId(pedidoPublicId)).thenReturn(Optional.of(pedido));

        ProcesarPagoDto dto = new ProcesarPagoDto(
                pedidoPublicId,
                MetodoPago.TARJETA,
                null,
                "RECHAZAR_TEST",
                "Juan Perez"
        );

        ResultadoProcesamientoPago resultado = finanzasServicio.procesarPagoPedido(dto, CLIENTE_ID);

        assertFalse(resultado.exitoso());
        assertEquals(EstadoPago.PENDIENTE, pedido.getEstadoPago());
        verify(pagoRepositorio, times(1)).save(any(Pago.class));
        verify(comisionRepositorio, never()).save(any(Comision.class));
    }

    @Test
    void obtenerResumenFinanciero_calculaTotalesCorrectamente() {
        when(pagoRepositorio.sumMontoAprobadoByTenantId(TENANT_ID)).thenReturn(new BigDecimal("1000.00"));
        when(comisionRepositorio.sumMontoComisionByTenantId(TENANT_ID)).thenReturn(new BigDecimal("50.00"));
        when(comisionRepositorio.sumMontoComisionPendienteByTenantId(TENANT_ID)).thenReturn(new BigDecimal("50.00"));
        when(pagoRepositorio.countByTenantIdAndEstado(TENANT_ID, EstadoTransaccionPago.APROBADO)).thenReturn(20L);

        ResumenFinancieroDto resumen = finanzasServicio.obtenerResumenFinanciero(TENANT_ID);

        assertNotNull(resumen);
        assertEquals(new BigDecimal("1000.00"), resumen.totalVentasAprobadas());
        assertEquals(new BigDecimal("50.00"), resumen.totalComisiones());
        assertEquals(new BigDecimal("950.00"), resumen.totalPorLiquidar());
        assertEquals(20L, resumen.pedidosPagados());
    }

    @Test
    void registrarPagoContraEntregaSiAplica_registraEfectivoYComision() {
        Pedido pedido = new Pedido(
                TENANT_ID,
                CLIENTE_ID,
                new BigDecimal("52.00"),
                BigDecimal.ZERO,
                new BigDecimal("52.00"),
                MetodoPago.EFECTIVO,
                "Av. Antunez 123",
                "",
                null,
                "",
                "123456"
        );
        ReflectionTestUtils.setField(pedido, "id", 70L);

        when(comisionRepositorio.existsByPedidoId(70L)).thenReturn(false);

        finanzasServicio.registrarPagoContraEntregaSiAplica(pedido);

        assertEquals(EstadoPago.PAGADO, pedido.getEstadoPago());
        verify(pagoRepositorio, times(1)).save(any(Pago.class));
        verify(comisionRepositorio, times(1)).save(any(Comision.class));
    }

    @Test
    void debeExportarReporteFinancieroCsvCorrectamente() {
        when(pagoRepositorio.sumMontoAprobadoByTenantId(TENANT_ID))
                .thenReturn(new BigDecimal("500.00"));
        when(comisionRepositorio.sumMontoComisionByTenantId(TENANT_ID))
                .thenReturn(new BigDecimal("25.00"));
        when(comisionRepositorio.sumMontoComisionPendienteByTenantId(TENANT_ID))
                .thenReturn(new BigDecimal("25.00"));
        when(pagoRepositorio.countByTenantIdAndEstado(TENANT_ID, EstadoTransaccionPago.APROBADO))
                .thenReturn(10L);
        when(pagoRepositorio.findByTenantIdOrderByCreatedAtDesc(TENANT_ID))
                .thenReturn(java.util.List.of());
        when(liquidacionRepositorio.findByTenantIdOrderByCreatedAtDesc(TENANT_ID))
                .thenReturn(java.util.List.of());

        byte[] csvBytes = finanzasServicio.exportarReporteFinancieroCsv(TENANT_ID);

        assertNotNull(csvBytes);
        assertTrue(csvBytes.length > 0);
        String contenido = new String(csvBytes, java.nio.charset.StandardCharsets.UTF_8);
        assertTrue(contenido.contains("PIDEGAS - REPORTE FINANCIERO"));
        assertTrue(contenido.contains("Tenant ID:,1"));
        assertTrue(contenido.contains("Total Ventas Aprobadas:,\"S/ 500.00\""));
    }
}
