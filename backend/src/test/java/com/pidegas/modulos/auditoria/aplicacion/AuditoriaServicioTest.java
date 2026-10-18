package com.pidegas.modulos.auditoria.aplicacion;

import com.pidegas.modulos.auditoria.dominio.RegistroAuditoria;
import com.pidegas.modulos.auditoria.dominio.TipoEventoAuditoria;
import com.pidegas.modulos.auditoria.dto.RegistroAuditoriaDto;
import com.pidegas.modulos.auditoria.repositorio.RegistroAuditoriaRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditoriaServicioTest {

    @Mock
    private RegistroAuditoriaRepositorio auditoriaRepositorio;

    private AuditoriaServicio auditoriaServicio;

    @BeforeEach
    void setUp() {
        auditoriaServicio = new AuditoriaServicioImpl(auditoriaRepositorio);
    }

    @Test
    void debeRegistrarEventoCorrectamente() {
        auditoriaServicio.registrarEvento(
                1L,
                10L,
                TipoEventoAuditoria.INICIO_SESION_EXITOSO,
                "Usuario autenticado",
                "192.168.1.100",
                "Mozilla/5.0",
                "{}"
        );

        verify(auditoriaRepositorio, times(1)).save(any(RegistroAuditoria.class));
    }

    @Test
    void debeListarUltimosEventos() {
        RegistroAuditoria reg = new RegistroAuditoria(
                1L,
                10L,
                TipoEventoAuditoria.CAMBIO_ESTADO_EMPRESA,
                "Empresa aprobada",
                "127.0.0.1",
                "Postman",
                null
        );

        when(auditoriaRepositorio.findTop100ByOrderByCreatedAtDesc()).thenReturn(List.of(reg));

        List<RegistroAuditoriaDto> lista = auditoriaServicio.listarUltimosEventos();

        assertNotNull(lista);
        assertEquals(1, lista.size());
        assertEquals(TipoEventoAuditoria.CAMBIO_ESTADO_EMPRESA, lista.get(0).tipoEvento());
        assertEquals("Empresa aprobada", lista.get(0).descripcion());
    }
}
