package com.pidegas.modulos.pedidos.dominio;

public enum EstadoPedido {
    PENDIENTE,
    CONFIRMADO,
    ASIGNADO,
    EN_CAMINO,
    ENTREGADO,
    CANCELADO;

    /**
     * Valida si la transición desde el estado actual hacia el nuevo estado es permitida.
     */
    public boolean puedeTransicionarA(EstadoPedido nuevoEstado) {
        if (this == nuevoEstado) {
            return true;
        }
        return switch (this) {
            case PENDIENTE -> nuevoEstado == CONFIRMADO || nuevoEstado == CANCELADO;
            case CONFIRMADO -> nuevoEstado == ASIGNADO || nuevoEstado == EN_CAMINO || nuevoEstado == CANCELADO;
            case ASIGNADO -> nuevoEstado == EN_CAMINO || nuevoEstado == CANCELADO;
            case EN_CAMINO -> nuevoEstado == ENTREGADO || nuevoEstado == CANCELADO;
            case ENTREGADO, CANCELADO -> false; // Estados finales
        };
    }
}
