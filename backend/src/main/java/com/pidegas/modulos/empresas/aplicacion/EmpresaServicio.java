package com.pidegas.modulos.empresas.aplicacion;

import com.pidegas.modulos.cobertura.dominio.ZonaCobertura;
import com.pidegas.modulos.cobertura.infraestructura.ZonaCoberturaRepositorio;
import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.dto.ActualizarEmpresaDto;
import com.pidegas.modulos.empresas.dto.EmpresaDetalleDto;
import com.pidegas.modulos.empresas.dto.RegistroEmpresaDto;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.identidad.dominio.EstadoUsuario;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EmpresaServicio {

    private final EmpresaRepositorio empresaRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final ZonaCoberturaRepositorio zonaCoberturaRepositorio;

    public EmpresaServicio(
            EmpresaRepositorio empresaRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            PasswordEncoder passwordEncoder) {
        this(empresaRepositorio, usuarioRepositorio, passwordEncoder, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public EmpresaServicio(
            EmpresaRepositorio empresaRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            PasswordEncoder passwordEncoder,
            ZonaCoberturaRepositorio zonaCoberturaRepositorio) {
        this.empresaRepositorio = empresaRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.zonaCoberturaRepositorio = zonaCoberturaRepositorio;
    }

    @Transactional
    public EmpresaDetalleDto registrarEmpresa(RegistroEmpresaDto dto) {
        if (empresaRepositorio.existsByRuc(dto.ruc().trim())) {
            throw new IllegalArgumentException("Ya existe una empresa registrada con el RUC " + dto.ruc());
        }

        if (usuarioRepositorio.existsByEmail(dto.adminEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("El correo del administrador ya está registrado en la plataforma.");
        }

        // 1. Crear el usuario administrador de la distribuidora
        Usuario adminEmpresa = new Usuario(
                null,
                dto.adminEmail().trim().toLowerCase(),
                passwordEncoder.encode(dto.adminPassword()),
                RolUsuario.EMPRESA,
                dto.adminNombres().trim(),
                dto.adminApellidos().trim(),
                dto.telefono() != null ? dto.telefono().trim() : null,
                EstadoUsuario.ACTIVO
        );
        adminEmpresa = usuarioRepositorio.save(adminEmpresa);

        // 2. Crear la empresa en estado PENDIENTE de aprobación
        Empresa empresa = new Empresa(
                null,
                adminEmpresa.getId(),
                dto.ruc().trim(),
                dto.nombreComercial().trim(),
                dto.razonSocial() != null ? dto.razonSocial().trim() : dto.nombreComercial().trim(),
                dto.telefono() != null ? dto.telefono().trim() : null,
                dto.emailContacto().trim().toLowerCase(),
                dto.direccionFiscal() != null ? dto.direccionFiscal().trim() : null,
                null,
                EstadoEmpresa.PENDIENTE
        );
        empresa = empresaRepositorio.save(empresa);

        return mapearADetalleDto(empresa);
    }

    @Transactional(readOnly = true)
    public EmpresaDetalleDto obtenerEmpresaActual() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        Empresa empresa = empresaRepositorio.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada para el tenant " + tenantId));

        return mapearADetalleDto(empresa);
    }

    @Transactional
    public EmpresaDetalleDto actualizarEmpresaActual(ActualizarEmpresaDto dto) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("No se encontró contexto de empresa (tenant) en la sesión actual.");
        }

        Empresa empresa = empresaRepositorio.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada para el tenant " + tenantId));

        empresa.setNombreComercial(dto.nombreComercial().trim());
        if (dto.razonSocial() != null) empresa.setRazonSocial(dto.razonSocial().trim());
        if (dto.telefono() != null) empresa.setTelefono(dto.telefono().trim());
        if (dto.emailContacto() != null) empresa.setEmailContacto(dto.emailContacto().trim());
        if (dto.direccionFiscal() != null) empresa.setDireccionFiscal(dto.direccionFiscal().trim());
        if (dto.logoUrl() != null) empresa.setLogoUrl(dto.logoUrl().trim());

        empresa = empresaRepositorio.save(empresa);
        return mapearADetalleDto(empresa);
    }

    @Transactional(readOnly = true)
    public List<EmpresaDetalleDto> listarEmpresasAdmin(EstadoEmpresa estado) {
        List<Empresa> lista;
        if (estado != null) {
            lista = empresaRepositorio.findByEstado(estado);
        } else {
            lista = empresaRepositorio.findAllByOrderByCreatedAtDesc();
        }
        return lista.stream().map(this::mapearADetalleDto).toList();
    }

    @Transactional
    public EmpresaDetalleDto cambiarEstadoEmpresa(UUID publicId, EstadoEmpresa nuevoEstado) {
        Empresa empresa = empresaRepositorio.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la empresa con ID público " + publicId));

        empresa.setEstado(nuevoEstado);
        empresa = empresaRepositorio.save(empresa);

        return mapearADetalleDto(empresa);
    }

    @Transactional
    public void cambiarPasswordAdminEmpresa(UUID publicId, String nuevaPassword) {
        if (nuevaPassword == null || nuevaPassword.trim().length() < 6) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 6 caracteres.");
        }

        Empresa empresa = empresaRepositorio.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la empresa con ID público " + publicId));

        if (empresa.getUsuarioAdminId() == null) {
            throw new IllegalStateException("La empresa no tiene un usuario administrador asociado.");
        }

        Usuario admin = usuarioRepositorio.findById(empresa.getUsuarioAdminId())
                .orElseThrow(() -> new IllegalStateException("No se encontró el usuario administrador asociado a la empresa."));

        admin.setPasswordHash(passwordEncoder.encode(nuevaPassword.trim()));
        usuarioRepositorio.save(admin);
    }

    @Transactional(readOnly = true)
    public List<EmpresaDetalleDto> listarEmpresasPublicas() {
        return empresaRepositorio.findByEstadoOrderByNombreComercialAsc(EstadoEmpresa.APROBADA)
                .stream()
                .map(this::mapearADetalleDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Long obtenerIdPorPublicId(UUID publicId) {
        return empresaRepositorio.findByPublicId(publicId)
                .map(Empresa::getId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la empresa con ID público " + publicId));
    }

    @Transactional(readOnly = true)
    public EmpresaDetalleDto obtenerPorPublicId(UUID publicId) {
        Empresa empresa = empresaRepositorio.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la empresa con ID público " + publicId));
        return mapearADetalleDto(empresa);
    }

    private EmpresaDetalleDto mapearADetalleDto(Empresa empresa) {
        String adminNombre = null;
        String adminEmail = null;
        String adminTelefono = null;

        if (empresa.getUsuarioAdminId() != null) {
            Usuario admin = usuarioRepositorio.findById(empresa.getUsuarioAdminId()).orElse(null);
            if (admin != null) {
                adminNombre = (admin.getNombres() + " " + admin.getApellidos()).trim();
                adminEmail = admin.getEmail();
                adminTelefono = admin.getTelefono();
            }
        }

        Double latitud = null;
        Double longitud = null;
        String zonaNombre = null;

        if (zonaCoberturaRepositorio != null) {
            try {
                List<ZonaCobertura> zonas = zonaCoberturaRepositorio.findByTenantIdAndActivaTrue(empresa.getId());
                if (!zonas.isEmpty()) {
                    ZonaCobertura z = zonas.get(0);
                    zonaNombre = z.getNombre();
                    if (z.getGeometria() != null) {
                        org.locationtech.jts.geom.Point c = z.getGeometria().getCentroid();
                        latitud = c.getY();
                        longitud = c.getX();
                    }
                }
            } catch (Exception ignored) {
            }
        }

        return new EmpresaDetalleDto(
                empresa.getPublicId(),
                empresa.getRuc(),
                empresa.getNombreComercial(),
                empresa.getRazonSocial(),
                empresa.getTelefono(),
                empresa.getEmailContacto(),
                empresa.getDireccionFiscal(),
                empresa.getLogoUrl(),
                empresa.getEstado(),
                empresa.getCreatedAt(),
                adminNombre,
                adminEmail,
                adminTelefono,
                latitud,
                longitud,
                zonaNombre
        );
    }
}
