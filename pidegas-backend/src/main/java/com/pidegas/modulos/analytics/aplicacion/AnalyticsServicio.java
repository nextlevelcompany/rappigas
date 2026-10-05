package com.pidegas.modulos.analytics.aplicacion;

import com.pidegas.modulos.analytics.dto.DashboardAdminDto;
import com.pidegas.modulos.analytics.dto.DashboardEmpresaDto;

public interface AnalyticsServicio {

    DashboardEmpresaDto obtenerDashboardEmpresa(Long tenantId);

    DashboardAdminDto obtenerDashboardAdmin();
}
