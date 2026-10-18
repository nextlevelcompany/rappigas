package com.pidegas.nucleo.configuracion;

import com.pidegas.modulos.catalogo.dominio.Producto;
import com.pidegas.modulos.catalogo.dominio.TipoBalonGas;
import com.pidegas.modulos.catalogo.dominio.TipoValvulaGas;
import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.identidad.dominio.EstadoUsuario;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@Profile("!test")
public class InicializadorDatos implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(InicializadorDatos.class);

    private final UsuarioRepositorio usuarioRepositorio;
    private final EmpresaRepositorio empresaRepositorio;
    private final com.pidegas.modulos.catalogo.repositorio.ProductoRepositorio productoRepositorio;
    private final com.pidegas.modulos.flota.repositorio.VehiculoRepositorio vehiculoRepositorio;
    private final com.pidegas.modulos.flota.repositorio.RepartidorRepositorio repartidorRepositorio;
    private final com.pidegas.modulos.inventario.repositorio.AlmacenRepositorio almacenRepositorio;
    private final com.pidegas.modulos.inventario.repositorio.StockProductoRepositorio stockProductoRepositorio;
    private final com.pidegas.modulos.inventario.repositorio.MovimientoStockRepositorio movimientoStockRepositorio;
    private final com.pidegas.modulos.fidelizacion.repositorio.CuponRepositorio cuponRepositorio;
    private final PasswordEncoder passwordEncoder;

    public InicializadorDatos(
            UsuarioRepositorio usuarioRepositorio,
            EmpresaRepositorio empresaRepositorio,
            com.pidegas.modulos.catalogo.repositorio.ProductoRepositorio productoRepositorio,
            com.pidegas.modulos.flota.repositorio.VehiculoRepositorio vehiculoRepositorio,
            com.pidegas.modulos.flota.repositorio.RepartidorRepositorio repartidorRepositorio,
            com.pidegas.modulos.inventario.repositorio.AlmacenRepositorio almacenRepositorio,
            com.pidegas.modulos.inventario.repositorio.StockProductoRepositorio stockProductoRepositorio,
            com.pidegas.modulos.inventario.repositorio.MovimientoStockRepositorio movimientoStockRepositorio,
            com.pidegas.modulos.fidelizacion.repositorio.CuponRepositorio cuponRepositorio,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.empresaRepositorio = empresaRepositorio;
        this.productoRepositorio = productoRepositorio;
        this.vehiculoRepositorio = vehiculoRepositorio;
        this.repartidorRepositorio = repartidorRepositorio;
        this.almacenRepositorio = almacenRepositorio;
        this.stockProductoRepositorio = stockProductoRepositorio;
        this.movimientoStockRepositorio = movimientoStockRepositorio;
        this.cuponRepositorio = cuponRepositorio;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Inicializando usuarios y roles base para PideGas MVP...");

        // 1. Super Admin
        if (!usuarioRepositorio.existsByEmail("admin@pidegas.pe")) {
            Usuario admin = new Usuario(
                    null,
                    "admin@pidegas.pe",
                    passwordEncoder.encode("AdminPassword123!"),
                    RolUsuario.ADMIN,
                    "Super",
                    "Administrador",
                    "+51999888777",
                    EstadoUsuario.ACTIVO
            );
            usuarioRepositorio.save(admin);
            log.info("Usuario Super Admin creado: admin@pidegas.pe");
        }

        // 2. Empresa Afiliada
        if (!usuarioRepositorio.existsByEmail("empresa@pidegas.pe")) {
            Usuario usuarioEmpresa = new Usuario(
                    null,
                    "empresa@pidegas.pe",
                    passwordEncoder.encode("EmpresaPassword123!"),
                    RolUsuario.EMPRESA,
                    "Carlos",
                    "Distribuidor",
                    "+51988777666",
                    EstadoUsuario.ACTIVO
            );
            usuarioEmpresa = usuarioRepositorio.save(usuarioEmpresa);

            Empresa empresa = new Empresa(
                    null,
                    usuarioEmpresa.getId(),
                    "20100070970",
                    "Gas Los Olivos Express",
                    "Distribuidora de Gas Los Olivos S.A.C.",
                    "+51988777666",
                    "contacto@gaslosolivos.pe",
                    "Av. Antúnez de Mayolo 1234, Los Olivos, Lima",
                    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200",
                    EstadoEmpresa.APROBADA
            );
            empresaRepositorio.save(empresa);
            log.info("Usuario Empresa y Distribuidora creada: empresa@pidegas.pe (Gas Los Olivos Express)");
        }

        // 3. Cliente de Prueba
        if (!usuarioRepositorio.existsByEmail("cliente@pidegas.pe")) {
            Usuario cliente = new Usuario(
                    null,
                    "cliente@pidegas.pe",
                    passwordEncoder.encode("ClientePassword123!"),
                    RolUsuario.CLIENTE,
                    "Juan",
                    "Pérez",
                    "+51977666555",
                    EstadoUsuario.ACTIVO
            );
            usuarioRepositorio.save(cliente);
            log.info("Usuario Cliente creado: cliente@pidegas.pe");
        }

        // 4. Repartidor de Prueba
        if (!usuarioRepositorio.existsByEmail("repartidor@pidegas.pe")) {
            Usuario repartidor = new Usuario(
                    null,
                    "repartidor@pidegas.pe",
                    passwordEncoder.encode("RepartidorPassword123!"),
                    RolUsuario.REPARTIDOR,
                    "Manuel",
                    "Rojas",
                    "+51966555444",
                    EstadoUsuario.ACTIVO
            );
            usuarioRepositorio.save(repartidor);
            log.info("Usuario Repartidor creado: repartidor@pidegas.pe");
        }

        // 5. Flota y Repartidor para Gas Los Olivos
        Usuario repUser = usuarioRepositorio.findByEmail("repartidor@pidegas.pe").orElse(null);
        if (repUser != null) {
            Empresa empLosOlivos = empresaRepositorio.findByRuc("20100070970").orElse(null);
            if (empLosOlivos != null) {
                Long empId = empLosOlivos.getId();
                if (!vehiculoRepositorio.existsByTenantIdAndPlaca(empId, "7821-4A")) {
                    com.pidegas.modulos.flota.dominio.Vehiculo moto = new com.pidegas.modulos.flota.dominio.Vehiculo(
                            empId,
                            "7821-4A",
                            "Wanxin",
                            "W150 Furgón Gas",
                            com.pidegas.modulos.flota.dominio.TipoVehiculo.MOTO_FURGON,
                            12
                    );
                    moto = vehiculoRepositorio.save(moto);

                    if (!repartidorRepositorio.existsByTenantIdAndUsuarioId(empId, repUser.getId())) {
                        com.pidegas.modulos.flota.dominio.Repartidor perfilRepartidor = new com.pidegas.modulos.flota.dominio.Repartidor(
                                empId,
                                repUser.getId(),
                                moto.getId(),
                                "Q-96655544"
                        );
                        repartidorRepositorio.save(perfilRepartidor);
                        log.info("Repartidor Manuel Rojas asignado a flota con vehículo 7821-4A");
                    }
                }
            }
        }

        // 6. Catálogo Base de Balones de Gas de Cocina para Empresas Aprobadas
        List<Empresa> empresas = empresaRepositorio.findAll();
        for (Empresa emp : empresas) {
            Long tenantId = emp.getId();
            if (productoRepositorio.findByTenantIdOrderByNombreAsc(tenantId).isEmpty()) {

                Producto p1 = new Producto(
                        tenantId,
                        "BALON-10KG-PREM",
                        "Balón de Gas de Cocina 10kg Premium (Click-On)",
                        "Balón de gas doméstico de 10kg con válvula de seguridad Premium tipo Click-On con auto-bloqueo ante fugas.",
                        TipoBalonGas.GLP_10KG,
                        TipoValvulaGas.PREMIUM,
                        new BigDecimal("52.00"),
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300"
                );

                Producto p2 = new Producto(
                        tenantId,
                        "BALON-10KG-ROSC",
                        "Balón de Gas de Cocina 10kg Tradicional (Rosca)",
                        "Balón de gas doméstico de 10kg con válvula convencional de rosca para cocinas tradicionales.",
                        TipoBalonGas.GLP_10KG,
                        TipoValvulaGas.ROSCA,
                        new BigDecimal("50.00"),
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300"
                );

                Producto p3 = new Producto(
                        tenantId,
                        "BALON-15KG-PREM",
                        "Balón de Gas de Cocina 15kg Familiar/Comercial",
                        "Balón de gas de 15kg de alto rendimiento para familias numerosas, restaurantes y negocios de comida.",
                        TipoBalonGas.GLP_15KG,
                        TipoValvulaGas.PREMIUM,
                        new BigDecimal("78.00"),
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300"
                );

                Producto p4 = new Producto(
                        tenantId,
                        "BALON-45KG-IND",
                        "Balón de Gas 45kg Comercial e Industrial",
                        "Cilindro de gas de 45kg para alta demanda comercial, pollerías, panaderías y cocinas industriales.",
                        TipoBalonGas.GLP_45KG,
                        TipoValvulaGas.ROSCA,
                        new BigDecimal("215.00"),
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300"
                );

                Producto p5 = new Producto(
                        tenantId,
                        "VALVULA-REG-01",
                        "Válvula Reguladora de Gas con Manómetro",
                        "Regulador de presión certificado Osinergmin con indicador de nivel de gas y manguera reforzada.",
                        TipoBalonGas.VALVULA_ACCESORIO,
                        TipoValvulaGas.PREMIUM,
                        new BigDecimal("38.00"),
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300"
                );

                productoRepositorio.saveAll(List.of(p1, p2, p3, p4, p5));
                log.info("Catálogo inicial de 5 Balones de Gas de Cocina creado para distribuidora ID {}", tenantId);
            }
        }

        // 7. Almacén e Inventario Inicial de Balones para Empresas
        for (Empresa emp : empresas) {
            Long tenantId = emp.getId();
            if (almacenRepositorio.findByTenantIdOrderByNombreAsc(tenantId).isEmpty()) {
                com.pidegas.modulos.inventario.dominio.Almacen almacen = new com.pidegas.modulos.inventario.dominio.Almacen(
                        tenantId,
                        "Almacén Central " + emp.getNombreComercial(),
                        emp.getDireccionFiscal() != null ? emp.getDireccionFiscal() : "Depósito Principal de Balones"
                );
                almacen = almacenRepositorio.save(almacen);

                List<Producto> prods = productoRepositorio.findByTenantIdOrderByNombreAsc(tenantId);
                for (Producto p : prods) {
                    int cant = switch (p.getTipoGas()) {
                        case GLP_10KG -> 50;
                        case GLP_15KG -> 25;
                        case GLP_45KG -> 10;
                        case VALVULA_ACCESORIO -> 30;
                    };
                    com.pidegas.modulos.inventario.dominio.StockProducto stock =
                            new com.pidegas.modulos.inventario.dominio.StockProducto(tenantId, almacen.getId(), p.getId(), cant, 5);
                    stockProductoRepositorio.save(stock);

                    com.pidegas.modulos.inventario.dominio.MovimientoStock mov =
                            new com.pidegas.modulos.inventario.dominio.MovimientoStock(
                                    tenantId,
                                    almacen.getId(),
                                    p.getId(),
                                    null,
                                    com.pidegas.modulos.inventario.dominio.TipoMovimientoStock.ENTRADA,
                                    cant,
                                    "Inventario inicial de apertura de operaciones"
                            );
                    movimientoStockRepositorio.save(mov);
                }
                log.info("Almacén principal y stock inicial creado para distribuidora '{}'", emp.getNombreComercial());
            }
        }

        // 8. Cupón de Descuento Promocional de Bienvenida
        for (Empresa emp : empresas) {
            Long tenantId = emp.getId();
            if (!cuponRepositorio.existsByTenantIdAndCodigoIgnoreCase(tenantId, "GASPRIMERO")) {
                com.pidegas.modulos.fidelizacion.dominio.Cupon cupon = new com.pidegas.modulos.fidelizacion.dominio.Cupon(
                        tenantId,
                        "GASPRIMERO",
                        com.pidegas.modulos.fidelizacion.dominio.TipoDescuento.MONTO_FIJO,
                        new java.math.BigDecimal("5.00"),
                        new java.math.BigDecimal("50.00"),
                        200,
                        java.time.OffsetDateTime.now(),
                        java.time.OffsetDateTime.now().plusMonths(6)
                );
                cuponRepositorio.save(cupon);
                log.info("Cupón promocional GASPRIMERO creado para distribuidora '{}'", emp.getNombreComercial());
            }
        }

        log.info("Inicialización de datos completada exitosamente.");
    }
}
