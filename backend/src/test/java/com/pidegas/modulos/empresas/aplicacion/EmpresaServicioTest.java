package com.pidegas.modulos.empresas.aplicacion;

import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.dto.ActualizarEmpresaDto;
import com.pidegas.modulos.empresas.dto.EmpresaDetalleDto;
import com.pidegas.modulos.empresas.dto.RegistroEmpresaDto;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmpresaServicioTest {

    @Mock
    private EmpresaRepositorio empresaRepositorio;

    @Mock
    private UsuarioRepositorio usuarioRepositorio;

    private PasswordEncoder passwordEncoder;
    private EmpresaServicio empresaServicio;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        empresaServicio = new EmpresaServicio(
                empresaRepositorio,
                usuarioRepositorio,
                passwordEncoder
        );
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void registrarEmpresa_Exitoso_QuedaEnEstadoPendiente() {
        RegistroEmpresaDto dto = new RegistroEmpresaDto(
                "20555666777",
                "LlamaGas Callao",
                "Distribuidora LlamaGas S.A.C.",
                "+51944332211",
                "ventas@llamagascallao.pe",
                "Av. Faucett 500, Callao",
                "admin@llamagascallao.pe",
                "SecurePass123!",
                "Roberto",
                "Sánchez"
        );

        when(empresaRepositorio.existsByRuc("20555666777")).thenReturn(false);
        when(usuarioRepositorio.existsByEmail("admin@llamagascallao.pe")).thenReturn(false);

        Usuario adminGuardado = new Usuario();
        adminGuardado.setId(101L);
        adminGuardado.setEmail("admin@llamagascallao.pe");
        adminGuardado.setRol(RolUsuario.EMPRESA);
        when(usuarioRepositorio.save(any(Usuario.class))).thenReturn(adminGuardado);

        Empresa empresaGuardada = new Empresa(
                UUID.randomUUID(),
                101L,
                "20555666777",
                "LlamaGas Callao",
                "Distribuidora LlamaGas S.A.C.",
                "+51944332211",
                "ventas@llamagascallao.pe",
                "Av. Faucett 500, Callao",
                null,
                EstadoEmpresa.PENDIENTE
        );
        empresaGuardada.setId(15L);
        when(empresaRepositorio.save(any(Empresa.class))).thenReturn(empresaGuardada);

        EmpresaDetalleDto resultado = empresaServicio.registrarEmpresa(dto);

        assertNotNull(resultado);
        assertEquals("20555666777", resultado.ruc());
        assertEquals("LlamaGas Callao", resultado.nombreComercial());
        assertEquals(EstadoEmpresa.PENDIENTE, resultado.estado());
        verify(empresaRepositorio, times(1)).save(any(Empresa.class));
    }

    @Test
    void registrarEmpresa_RucDuplicado_LanzaExcepcion() {
        RegistroEmpresaDto dto = new RegistroEmpresaDto(
                "20100070970",
                "Gas Repetido",
                null,
                null,
                "info@gas.pe",
                null,
                "admin@gas.pe",
                "Password123!",
                "Admin",
                "User"
        );

        when(empresaRepositorio.existsByRuc("20100070970")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> empresaServicio.registrarEmpresa(dto));
        verify(usuarioRepositorio, never()).save(any());
        verify(empresaRepositorio, never()).save(any());
    }

    @Test
    void obtenerEmpresaActual_ConTenantContext_Exitoso() {
        TenantContext.setTenantId(1L);

        Empresa empresa = new Empresa();
        empresa.setId(1L);
        empresa.setPublicId(UUID.randomUUID());
        empresa.setRuc("20100070970");
        empresa.setNombreComercial("Gas Los Olivos Express");
        empresa.setEstado(EstadoEmpresa.APROBADA);

        when(empresaRepositorio.findById(1L)).thenReturn(Optional.of(empresa));

        EmpresaDetalleDto resultado = empresaServicio.obtenerEmpresaActual();

        assertNotNull(resultado);
        assertEquals("Gas Los Olivos Express", resultado.nombreComercial());
        assertEquals(EstadoEmpresa.APROBADA, resultado.estado());
    }

    @Test
    void obtenerEmpresaActual_SinTenantContext_LanzaAccessDeniedException() {
        TenantContext.clear(); // Sin tenant establecido

        assertThrows(AccessDeniedException.class, () -> empresaServicio.obtenerEmpresaActual());
    }

    @Test
    void actualizarEmpresaActual_AislaPorTenantContext() {
        TenantContext.setTenantId(2L);

        Empresa empresaTenant2 = new Empresa();
        empresaTenant2.setId(2L);
        empresaTenant2.setPublicId(UUID.randomUUID());
        empresaTenant2.setRuc("20222333444");
        empresaTenant2.setNombreComercial("Distribuidora B");

        when(empresaRepositorio.findById(2L)).thenReturn(Optional.of(empresaTenant2));
        when(empresaRepositorio.save(any(Empresa.class))).thenAnswer(i -> i.getArgument(0));

        ActualizarEmpresaDto dto = new ActualizarEmpresaDto(
                "Distribuidora B Actualizada",
                "Nueva Razon S.A.C.",
                "+51988112233",
                "contacto@distribuidorab.pe",
                "Av. Próceres 789",
                "https://logo.png"
        );

        EmpresaDetalleDto resultado = empresaServicio.actualizarEmpresaActual(dto);

        assertNotNull(resultado);
        assertEquals("Distribuidora B Actualizada", resultado.nombreComercial());
        assertEquals("https://logo.png", resultado.logoUrl());
        verify(empresaRepositorio).findById(2L);
        verify(empresaRepositorio, never()).findById(1L); // Asegura que jamás toca el tenant 1
    }

    @Test
    void cambiarEstadoEmpresa_AdminApruebaEmpresa() {
        UUID publicId = UUID.randomUUID();
        Empresa empresaPendiente = new Empresa();
        empresaPendiente.setPublicId(publicId);
        empresaPendiente.setEstado(EstadoEmpresa.PENDIENTE);
        empresaPendiente.setNombreComercial("Distribuidora San Martín");

        when(empresaRepositorio.findByPublicId(publicId)).thenReturn(Optional.of(empresaPendiente));
        when(empresaRepositorio.save(any(Empresa.class))).thenAnswer(i -> i.getArgument(0));

        EmpresaDetalleDto resultado = empresaServicio.cambiarEstadoEmpresa(publicId, EstadoEmpresa.APROBADA);

        assertNotNull(resultado);
        assertEquals(EstadoEmpresa.APROBADA, resultado.estado());
        assertEquals(EstadoEmpresa.APROBADA, empresaPendiente.getEstado());
    }
}
