package com.pidegas.modulos.cobertura.aplicacion;

import com.pidegas.modulos.cobertura.dominio.ZonaCobertura;
import com.pidegas.modulos.cobertura.dto.*;
import com.pidegas.modulos.cobertura.infraestructura.ZonaCoberturaRepositorio;
import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Polygon;
import org.mockito.Mockito;
import org.springframework.security.access.AccessDeniedException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ZonaCoberturaServicioTest {

    private ZonaCoberturaRepositorio zonaCoberturaRepositorio;
    private EmpresaRepositorio empresaRepositorio;
    private ZonaCoberturaServicio zonaCoberturaServicio;

    @BeforeEach
    void setUp() {
        zonaCoberturaRepositorio = Mockito.mock(ZonaCoberturaRepositorio.class);
        empresaRepositorio = Mockito.mock(EmpresaRepositorio.class);
        zonaCoberturaServicio = new ZonaCoberturaServicio(zonaCoberturaRepositorio, empresaRepositorio);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void construirPoligono_anilloCerrado_valido() {
        List<List<Double>> coords = List.of(
                List.of(-77.05, -12.05),
                List.of(-77.01, -12.05),
                List.of(-77.01, -12.09),
                List.of(-77.05, -12.09),
                List.of(-77.05, -12.05)
        );

        Polygon polygon = zonaCoberturaServicio.construirPoligono(coords);

        assertNotNull(polygon);
        assertEquals(4326, polygon.getSRID());
        assertEquals(5, polygon.getCoordinates().length);
    }

    @Test
    void construirPoligono_cierraAnilloAutomaticamenteSiNoEstaCerrado() {
        List<List<Double>> coords = List.of(
                List.of(-77.05, -12.05),
                List.of(-77.01, -12.05),
                List.of(-77.01, -12.09),
                List.of(-77.05, -12.09)
        );

        Polygon polygon = zonaCoberturaServicio.construirPoligono(coords);

        assertNotNull(polygon);
        assertEquals(5, polygon.getCoordinates().length);
        assertEquals(polygon.getCoordinates()[0], polygon.getCoordinates()[4]);
    }

    @Test
    void construirPoligono_menosDeCuatroPuntos_lanzaExcepcion() {
        List<List<Double>> coords = List.of(
                List.of(-77.05, -12.05),
                List.of(-77.01, -12.05),
                List.of(-77.05, -12.05)
        );

        assertThrows(IllegalArgumentException.class, () -> zonaCoberturaServicio.construirPoligono(coords));
    }

    @Test
    void crearZona_conTenantContext_guardaExitosamente() {
        TenantContext.setTenantId(10L);

        List<List<Double>> coords = List.of(
                List.of(-77.05, -12.05),
                List.of(-77.01, -12.05),
                List.of(-77.01, -12.09),
                List.of(-77.05, -12.09),
                List.of(-77.05, -12.05)
        );
        CrearZonaCoberturaDto dto = new CrearZonaCoberturaDto("Zona Norte Los Olivos", coords);

        when(zonaCoberturaRepositorio.save(any(ZonaCobertura.class))).thenAnswer(inv -> {
            ZonaCobertura z = inv.getArgument(0);
            return z;
        });

        ZonaCoberturaDetalleDto resultado = zonaCoberturaServicio.crearZona(dto);

        assertNotNull(resultado);
        assertEquals(10L, resultado.tenantId());
        assertEquals("Zona Norte Los Olivos", resultado.nombre());
        assertTrue(resultado.activa());
        assertEquals(5, resultado.coordenadas().size());
        verify(zonaCoberturaRepositorio, times(1)).save(any(ZonaCobertura.class));
    }

    @Test
    void crearZona_sinTenantContext_lanzaAccessDeniedException() {
        TenantContext.clear();

        List<List<Double>> coords = List.of(
                List.of(-77.05, -12.05),
                List.of(-77.01, -12.05),
                List.of(-77.01, -12.09),
                List.of(-77.05, -12.09),
                List.of(-77.05, -12.05)
        );
        CrearZonaCoberturaDto dto = new CrearZonaCoberturaDto("Zona Prueba", coords);

        assertThrows(AccessDeniedException.class, () -> zonaCoberturaServicio.crearZona(dto));
    }

    @Test
    void verificarCobertura_puntoCubierto_retornaTieneCoberturaTrue() {
        List<List<Double>> coords = List.of(
                List.of(-77.05, -12.05),
                List.of(-77.01, -12.05),
                List.of(-77.01, -12.09),
                List.of(-77.05, -12.09),
                List.of(-77.05, -12.05)
        );
        Polygon polygon = zonaCoberturaServicio.construirPoligono(coords);
        ZonaCobertura zona = new ZonaCobertura(1L, "Zona Lima Centro", polygon);

        Empresa empresa = new Empresa();
        empresa.setRuc("20100070970");
        empresa.setNombreComercial("Llama Gas");
        empresa.setEmailContacto("contacto@llamagas.pe");
        empresa.setEstado(EstadoEmpresa.APROBADA);

        when(zonaCoberturaRepositorio.buscarZonasQueCubrenPunto(-77.03, -12.07)).thenReturn(List.of(zona));
        when(empresaRepositorio.findAllById(any())).thenReturn(List.of(empresa));

        VerificarCoberturaDto consulta = new VerificarCoberturaDto(-12.07, -77.03);
        RespuestaVerificarCoberturaDto resultado = zonaCoberturaServicio.verificarCobertura(consulta);

        assertTrue(resultado.tieneCobertura());
        assertEquals(1, resultado.totalDistribuidoras());
        assertEquals("20100070970", resultado.distribuidorasDisponibles().get(0).ruc());
    }

    @Test
    void verificarCobertura_puntoSinCobertura_retornaFalse() {
        when(zonaCoberturaRepositorio.buscarZonasQueCubrenPunto(-75.0, -10.0)).thenReturn(List.of());

        VerificarCoberturaDto consulta = new VerificarCoberturaDto(-10.0, -75.0);
        RespuestaVerificarCoberturaDto resultado = zonaCoberturaServicio.verificarCobertura(consulta);

        assertFalse(resultado.tieneCobertura());
        assertEquals(0, resultado.totalDistribuidoras());
        assertTrue(resultado.distribuidorasDisponibles().isEmpty());
    }
}
