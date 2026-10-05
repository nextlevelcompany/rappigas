package com.pidegas.modulos.identidad.repositorio;

import com.pidegas.modulos.identidad.dominio.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByPublicId(UUID publicId);

    boolean existsByEmail(String email);

    long countByRol(com.pidegas.modulos.identidad.dominio.RolUsuario rol);
}
