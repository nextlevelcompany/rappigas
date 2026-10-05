package com.pidegas.nucleo.seguridad;

/**
 * Contexto de Tenant en ThreadLocal para aislamiento Zero Trust multi-empresa.
 * El tenant_id nunca se acepta ciegamente desde el cliente frontend;
 * se deriva estrictamente de la identidad autenticada (JWT) o contexto de sesión.
 */
public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setTenantId(Long tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static Long getTenantId() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
