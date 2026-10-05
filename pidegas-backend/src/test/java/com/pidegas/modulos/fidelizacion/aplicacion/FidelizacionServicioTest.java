package com.pidegas.modulos.fidelizacion.aplicacion;

import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.fidelizacion.dominio.*;
import com.pidegas.modulos.fidelizacion.dto.*;
import com.pidegas.modulos.fidelizacion.repositorio.BilleteraPuntosRepositorio;
import com.pidegas.modulos.fidelizacion.repositorio.CuponRepositorio;
import com.pidegas.modulos.fidelizacion.repositorio.MovimientoPuntosRepositorio;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FidelizacionServicioTest {

    private BilleteraPuntosRepositorio billeteraPuntosRepositorio;
    private MovimientoPuntosRepositorio movimientoPuntosRepositorio;
    private CuponRepositorio cuponRepositorio;
    private UsuarioRepositorio usuarioRepositorio;
    private EmpresaRepositorio empresaRepositorio;

    private FidelizacionServicio fidelizacionServicio;
    private final Long TENANT_ID = 1L;

    @BeforeEach
    void setUp() {
        billeteraPuntosRepositorio = mock(BilleteraPuntosRepositorio.class);
        movimientoPuntosRepositorio = mock(MovimientoPuntosRepositorio.class);
        cuponRepositorio = mock(CuponRepositorio.class);
        usuarioRepositorio = mock(UsuarioRepositorio.class);
        empresaRepositorio = mock(EmpresaRepositorio.class);

        fidelizacionServicio = new FidelizacionServicioImpl(
                billeteraPuntosRepositorio,
                movimientoPuntosRepositorio,
                cuponRepositorio,
                usuarioRepositorio,
                empresaRepositorio
        );

        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void acumularPuntosPorPedido_acumulaPuntosCorrectamente() {
        Long clienteId = 15L;
        Pedido pedido = new Pedido(TENANT_ID, clienteId, new BigDecimal("100.00"), BigDecimal.ZERO,
                new BigDecimal("100.00"), com.pidegas.modulos.pedidos.dominio.MetodoPago.EFECTIVO,
                "Av. Lima 123", "Ref", null, "", "123456");
        ReflectionTestUtils.setField(pedido, "id", 200L);

        BilleteraPuntos billetera = new BilleteraPuntos(clienteId);
        billetera.setSaldoPuntos(30);

        when(billeteraPuntosRepositorio.findByClienteId(clienteId)).thenReturn(Optional.of(billetera));

        fidelizacionServicio.acumularPuntosPorPedido(pedido);

        // 100 / 5 = 20 puntos. 30 + 20 = 50 puntos.
        assertEquals(50, billetera.getSaldoPuntos());
        verify(billeteraPuntosRepositorio, times(1)).save(billetera);
        verify(movimientoPuntosRepositorio, times(1)).save(any(MovimientoPuntos.class));
    }

    @Test
    void validarCupon_exitoso_calculaDescuento() {
        Cupon cupon = new Cupon(
                TENANT_ID,
                "GAS10",
                TipoDescuento.PORCENTAJE,
                new BigDecimal("10.00"),
                new BigDecimal("50.00"),
                100,
                OffsetDateTime.now().minusDays(1),
                OffsetDateTime.now().plusMonths(1)
        );

        when(cuponRepositorio.findByCodigoValido(eq("GAS10"), any())).thenReturn(java.util.List.of(cupon));

        ValidarCuponDto dto = new ValidarCuponDto("GAS10", new BigDecimal("100.00"), null);
        ResultadoValidacionCuponDto resultado = fidelizacionServicio.validarCupon(dto);

        assertTrue(resultado.valido());
        assertEquals(new BigDecimal("10.00"), resultado.descuento());
        assertEquals(new BigDecimal("90.00"), resultado.nuevoTotal());
    }

    @Test
    void validarCupon_invalidoPorMontoMinimo() {
        Cupon cupon = new Cupon(
                TENANT_ID,
                "GAS50",
                TipoDescuento.MONTO_FIJO,
                new BigDecimal("15.00"),
                new BigDecimal("80.00"),
                100,
                OffsetDateTime.now().minusDays(1),
                OffsetDateTime.now().plusMonths(1)
        );

        when(cuponRepositorio.findByCodigoValido(eq("GAS50"), any())).thenReturn(java.util.List.of(cupon));

        ValidarCuponDto dto = new ValidarCuponDto("GAS50", new BigDecimal("50.00"), null);
        ResultadoValidacionCuponDto resultado = fidelizacionServicio.validarCupon(dto);

        assertFalse(resultado.valido());
        assertEquals(BigDecimal.ZERO, resultado.descuento());
        assertTrue(resultado.mensaje().contains("pedido mínimo"));
    }

    @Test
    void crearCupon_exitoso() {
        CrearCuponDto dto = new CrearCuponDto(
                "DESCUENTO5",
                TipoDescuento.MONTO_FIJO,
                new BigDecimal("5.00"),
                new BigDecimal("50.00"),
                50,
                OffsetDateTime.now(),
                OffsetDateTime.now().plusDays(30)
        );

        when(cuponRepositorio.existsByTenantIdAndCodigoIgnoreCase(TENANT_ID, "DESCUENTO5")).thenReturn(false);
        when(cuponRepositorio.save(any(Cupon.class))).thenAnswer(inv -> inv.getArgument(0));

        CuponDetalleDto resultado = fidelizacionServicio.crearCupon(dto);

        assertNotNull(resultado);
        assertEquals("DESCUENTO5", resultado.codigo());
        verify(cuponRepositorio, times(1)).save(any(Cupon.class));
    }
}
