package com.pidegas.modulos.finanzas.sunat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class FacturadorElectronicoSimuladoImpl implements FacturadorElectronico {

    private static final Logger log = LoggerFactory.getLogger(FacturadorElectronicoSimuladoImpl.class);

    @Override
    public ResultadoEmisionComprobante emitirComprobante(SolicitudComprobante solicitud) {
        log.info("Simulando emisión de comprobante electrónico para pedido {}. Tipo: {}, Total: S/ {}",
                solicitud.pedidoPublicId(), solicitud.tipoComprobante(), solicitud.total());

        String serie = "FACTURA".equalsIgnoreCase(solicitud.tipoComprobante()) ? "F001" : "B001";
        int correlativo = ThreadLocalRandom.current().nextInt(1000, 99999);
        String serieNumero = serie + "-" + String.format("%08d", correlativo);
        String hashCdr = UUID.randomUUID().toString().replace("-", "").substring(0, 28);
        String linkPdf = "https://facturacion.pidegas.pe/cpe/" + serieNumero + ".pdf";

        return ResultadoEmisionComprobante.exitoso(serieNumero, hashCdr, linkPdf);
    }
}
