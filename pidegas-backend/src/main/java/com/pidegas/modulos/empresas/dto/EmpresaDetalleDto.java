package com.pidegas.modulos.empresas.dto;

import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import java.time.Instant;
import java.util.UUID;

public record EmpresaDetalleDto(
        UUID publicId,
        String ruc,
        String nombreComercial,
        String razonSocial,
        String telefono,
        String emailContacto,
        String direccionFiscal,
        String logoUrl,
        EstadoEmpresa estado,
        Instant createdAt,
        String adminNombre,
        String adminEmail,
        String adminTelefono
) {
    public EmpresaDetalleDto(
            UUID publicId,
            String ruc,
            String nombreComercial,
            String razonSocial,
            String telefono,
            String emailContacto,
            String direccionFiscal,
            String logoUrl,
            EstadoEmpresa estado,
            Instant createdAt
    ) {
        this(publicId, ruc, nombreComercial, razonSocial, telefono, emailContacto,
             direccionFiscal, logoUrl, estado, createdAt, null, null, null);
    }
}
