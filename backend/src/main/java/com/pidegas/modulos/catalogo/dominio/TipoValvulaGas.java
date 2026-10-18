package com.pidegas.modulos.catalogo.dominio;

public enum TipoValvulaGas {
    PREMIUM("Válvula Premium Click-On"),
    ROSCA("Válvula Tradicional de Rosca"),
    NINGUNA("Sin Válvula / Accesorio");

    private final String descripcion;

    TipoValvulaGas(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
