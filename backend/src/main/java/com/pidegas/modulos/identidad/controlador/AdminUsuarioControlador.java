package com.pidegas.modulos.identidad.controlador;

import com.pidegas.modulos.identidad.aplicacion.AutenticacionServicio;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dto.UsuarioDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Super Admin - Usuarios", description = "Endpoints administrativos para supervisión de usuarios y clientes")
public class AdminUsuarioControlador {

    private final AutenticacionServicio autenticacionServicio;

    public AdminUsuarioControlador(AutenticacionServicio autenticacionServicio) {
        this.autenticacionServicio = autenticacionServicio;
    }

    @GetMapping
    @Operation(summary = "Listar usuarios para Super Admin", description = "Lista usuarios de la plataforma con filtro opcional por rol (CLIENTE, REPARTIDOR, EMPRESA, ADMIN).")
    public ResponseEntity<List<UsuarioDetalleDto>> listarUsuarios(
            @RequestParam(required = false) RolUsuario rol) {
        return ResponseEntity.ok(autenticacionServicio.listarUsuariosAdmin(rol));
    }
}
