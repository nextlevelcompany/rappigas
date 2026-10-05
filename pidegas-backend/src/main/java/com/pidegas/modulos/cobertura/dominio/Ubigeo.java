package com.pidegas.modulos.cobertura.dominio;

import jakarta.persistence.*;

@Entity
@Table(name = "ubigeo")
public class Ubigeo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_inei", nullable = false, unique = true, length = 6)
    private String codigoInei;

    @Column(name = "departamento", nullable = false, length = 50)
    private String departamento;

    @Column(name = "provincia", nullable = false, length = 50)
    private String provincia;

    @Column(name = "distrito", nullable = false, length = 50)
    private String distrito;

    public Ubigeo() {}

    public Ubigeo(String codigoInei, String departamento, String provincia, String distrito) {
        this.codigoInei = codigoInei;
        this.departamento = departamento;
        this.provincia = provincia;
        this.distrito = distrito;
    }

    public Long getId() {
        return id;
    }

    public String getCodigoInei() {
        return codigoInei;
    }

    public void setCodigoInei(String codigoInei) {
        this.codigoInei = codigoInei;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public String getDistrito() {
        return distrito;
    }

    public void setDistrito(String distrito) {
        this.distrito = distrito;
    }
}
