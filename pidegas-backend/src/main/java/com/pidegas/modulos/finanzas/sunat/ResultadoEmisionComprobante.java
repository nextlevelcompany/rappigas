package com.pidegas.modulos.finanzas.sunat;

public record ResultadoEmisionComprobante(
        boolean emitido,
        String serieNumero,
        String hashCdr,
        String estadoCdr,
        String enlacePdf,
        String mensaje
) {
    public static ResultadoEmisionComprobante exitoso(String serieNumero, String hashCdr, String linkPdf) {
        return new ResultadoEmisionComprobante(true, serieNumero, hashCdr, "ACEPTADO", linkPdf, "Comprobante electrónico generado exitosamente.");
    }
}
