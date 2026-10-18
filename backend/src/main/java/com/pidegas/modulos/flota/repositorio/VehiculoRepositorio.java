package com.pidegas.modulos.flota.repositorio;

import com.pidegas.modulos.flota.dominio.EstadoVehiculo;
import com.pidegas.modulos.flota.dominio.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehiculoRepositorio extends JpaRepository<Vehiculo, Long> {

    List<Vehiculo> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    List<Vehiculo> findByTenantIdAndEstado(Long tenantId, EstadoVehiculo estado);

    Optional<Vehiculo> findByPublicIdAndTenantId(UUID publicId, Long tenantId);

    Optional<Vehiculo> findByPublicId(UUID publicId);

    boolean existsByTenantIdAndPlaca(Long tenantId, String placa);
}
