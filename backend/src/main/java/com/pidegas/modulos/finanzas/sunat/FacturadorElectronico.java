package com.pidegas.modulos.finanzas.sunat;

public interface FacturadorElectronico {

    ResultadoEmisionComprobante emitirComprobante(SolicitudComprobante solicitud);
}
