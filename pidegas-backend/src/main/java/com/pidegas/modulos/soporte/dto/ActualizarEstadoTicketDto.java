package com.pidegas.modulos.soporte.dto;

import com.pidegas.modulos.soporte.dominio.EstadoTicket;
import jakarta.validation.constraints.NotNull;

public class ActualizarEstadoTicketDto {

    @NotNull(message = "El nuevo estado del ticket es obligatorio")
    private EstadoTicket estado;

    public ActualizarEstadoTicketDto() {
    }

    public ActualizarEstadoTicketDto(EstadoTicket estado) {
        this.estado = estado;
    }

    public EstadoTicket getEstado() {
        return estado;
    }

    public void setEstado(EstadoTicket estado) {
        this.estado = estado;
    }
}
