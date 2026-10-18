package com.pidegas.modulos.soporte.dto;

public class ResumenSoporteDto {

    private long abiertos;
    private long enProceso;
    private long resueltos;
    private long cerrados;
    private long total;

    public ResumenSoporteDto() {
    }

    public ResumenSoporteDto(long abiertos, long enProceso, long resueltos, long cerrados, long total) {
        this.abiertos = abiertos;
        this.enProceso = enProceso;
        this.resueltos = resueltos;
        this.cerrados = cerrados;
        this.total = total;
    }

    public long getAbiertos() {
        return abiertos;
    }

    public void setAbiertos(long abiertos) {
        this.abiertos = abiertos;
    }

    public long getEnProceso() {
        return enProceso;
    }

    public void setEnProceso(long enProceso) {
        this.enProceso = enProceso;
    }

    public long getResueltos() {
        return resueltos;
    }

    public void setResueltos(long resueltos) {
        this.resueltos = resueltos;
    }

    public long getCerrados() {
        return cerrados;
    }

    public void setCerrados(long cerrados) {
        this.cerrados = cerrados;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }
}
