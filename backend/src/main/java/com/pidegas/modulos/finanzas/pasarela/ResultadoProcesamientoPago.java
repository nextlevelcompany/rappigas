package com.pidegas.modulos.finanzas.pasarela;

public record ResultadoProcesamientoPago(
        boolean exitoso,
        String referenciaTransaccion,
        String codigoAutorizacion,
        String mensaje,
        String metadata
) {
    public static ResultadoProcesamientoPago exitoso(String ref, String authCode, String msg, String metadata) {
        return new ResultadoProcesamientoPago(true, ref, authCode, msg, metadata);
    }

    public static ResultadoProcesamientoPago fallido(String msg) {
        return new ResultadoProcesamientoPago(false, null, null, msg, null);
    }
}
