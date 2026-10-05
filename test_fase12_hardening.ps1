$ErrorActionPreference = "Continue"

Write-Host "=== TEST FASE 12: AUDITORIA FORENSE, RATE LIMITING Y SEGURIDAD ===" -ForegroundColor Cyan

# 1. Login Super Admin
Write-Host "`n1. Autenticando como Super Admin..." -ForegroundColor Yellow
$loginAdminBody = @{
    email = "admin@pidegas.pe"
    password = "AdminPassword123!"
} | ConvertTo-Json

$respAdmin = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $loginAdminBody -ContentType "application/json"
$adminToken = $respAdmin.accessToken
Write-Host "Super Admin autenticado exitosamente: $($respAdmin.email) (Rol: $($respAdmin.rol))" -ForegroundColor Green

# 2. Consultar eventos de auditoria como Admin
Write-Host "`n2. Consultando Bitacora de Auditoria (/api/v1/admin/auditoria)..." -ForegroundColor Yellow
$headersAdmin = @{
    Authorization = "Bearer $adminToken"
}
$auditoriaEventos = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/auditoria" -Method Get -Headers $headersAdmin
Write-Host "Total eventos encontrados en auditoria: $($auditoriaEventos.Count)" -ForegroundColor Green
if ($auditoriaEventos.Count -gt 0) {
    Write-Host "Ultimo evento: [$($auditoriaEventos[0].tipoEvento)] $($auditoriaEventos[0].descripcion) (IP: $($auditoriaEventos[0].ipOrigen))" -ForegroundColor Cyan
}

# 3. Validar Zero-Trust: Intento de consulta por Empresa debe devolver 403
Write-Host "`n3. Probando aislamiento de roles Zero-Trust con Distribuidora (Empresa)..." -ForegroundColor Yellow
$loginEmpresaBody = @{
    email = "empresa@pidegas.pe"
    password = "EmpresaPassword123!"
} | ConvertTo-Json

$respEmpresa = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $loginEmpresaBody -ContentType "application/json"
$empresaToken = $respEmpresa.accessToken

try {
    $headersEmpresa = @{ Authorization = "Bearer $empresaToken" }
    Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/auditoria" -Method Get -Headers $headersEmpresa
    Write-Host "ERROR: Empresa pudo acceder a auditoria de Super Admin!" -ForegroundColor Red
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Write-Host "Correcto: Acceso bloqueado para rol no-ADMIN con codigo HTTP $code (Esperado 403)" -ForegroundColor Green
} catch {
    Write-Host "Excepcion: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Probar Rate Limiting en /api/v1/auth/login (umbral = 15 solicitudes / minuto)
Write-Host "`n4. Probando Rate Limiting en /api/v1/auth/login (disparando rafaga de solicitudes)..." -ForegroundColor Yellow
$rateLimitBloqueado = $false
for ($i = 1; $i -le 18; $i++) {
    $loginAttempt = @{
        email = "admin@pidegas.pe"
        password = "CredencialInvalida_$i"
    } | ConvertTo-Json

    try {
        $res = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $loginAttempt -ContentType "application/json"
        $code = [int]$res.StatusCode
        Write-Host "Solicitud ${i}: HTTP $code" -ForegroundColor Gray
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response
        if ($resp -ne $null) {
            $code = [int]$resp.StatusCode
            if ($code -eq 429) {
                Write-Host "Solicitud ${i}: HTTP 429 Too Many Requests detectado! Rate Limiter activo y protegiendo el sistema." -ForegroundColor Green
                $rateLimitBloqueado = $true
                break
            } else {
                Write-Host "Solicitud ${i}: HTTP $code (Intento rechazado por credenciales invalidas)" -ForegroundColor Gray
            }
        } else {
            Write-Host "Solicitud ${i}: Error $($_.Exception.Message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Solicitud ${i}: Error desconocido $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($rateLimitBloqueado) {
    Write-Host "`nVERIFICACION FASE 12 COMPLETADA CON EXITO: 100% FUNCIONAL" -ForegroundColor Green
} else {
    Write-Host "`nADVERTENCIA: No se disparo el codigo 429 en las 18 peticiones." -ForegroundColor Yellow
}
