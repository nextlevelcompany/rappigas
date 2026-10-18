package com.pidegas.modulos.catalogo.dominio;

public enum TipoBalonGas {
    GLP_10KG("Balón de Gas de Cocina 10kg"),
    GLP_15KG("Balón de Gas de Cocina 15kg"),
    GLP_45KG("Balón de Gas Comercial/Industrial 45kg"),
    VALVULA_ACCESORIO("Válvula y Regulador de Gas de Cocina");

    private final String descripcion;

    TipoBalonGas(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
