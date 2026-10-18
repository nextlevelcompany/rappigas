package com.pidegas.modulos.pedidos.repositorio;

import com.pidegas.modulos.pedidos.dominio.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepositorio extends JpaRepository<DetallePedido, Long> {

    List<DetallePedido> findByPedidoId(Long pedidoId);

    void deleteByPedidoId(Long pedidoId);
}
