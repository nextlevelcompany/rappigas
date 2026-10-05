package com.pidegas.modulos.finanzas.pasarela;

public interface PasarelaPagos {

    ResultadoProcesamientoPago procesarPago(SolicitudPago solicitud);

    ResultadoProcesamientoPago verificarEstado(String referenciaTransaccion);
}
