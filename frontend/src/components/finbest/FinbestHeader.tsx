"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { User, Truck, Shield, Navigation, LogOut } from "lucide-react";

export default function FinbestHeader() {
  const router = useRouter();
  const { usuario, estaAutenticado, cerrarSesion } = useAuthStore();
  const [montado, setMontado] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setMontado(true);
    const handleScroll = () => {
      setSticky(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const usuarioActivo = montado ? usuario : null;
  const autenticadoActivo = montado ? estaAutenticado : false;

  const getRutaPanel = () => {
    if (!usuarioActivo) return "/auth/login";
    switch (usuarioActivo.rol) {
      case "CLIENTE":
        return "/cliente/tienda";
      case "EMPRESA":
        return "/empresa/dashboard";
      case "REPARTIDOR":
        return "/repartidor/pedidos";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/auth/login";
    }
  };

  const getTextoBotonPanel = () => {
    if (!usuarioActivo) return "Iniciar Sesión";
    switch (usuarioActivo.rol) {
      case "CLIENTE":
        return "Mi Cuenta";
      case "EMPRESA":
        return "Panel Empresa";
      case "REPARTIDOR":
        return "Mis Entregas";
      case "ADMIN":
        return "Panel Global";
      default:
        return "Mi Panel";
    }
  };

  const handleLogout = () => {
    cerrarSesion();
    router.push("/");
  };

  return (
    <>
      <header
        id="header-sticky"
        className={`tp-header-area-2 p-relative tp-header-height ${
          sticky ? "tp-header-sticky" : ""
        }`}
      >
        <div className="tp-header-space-2">
          <div className="container-fluid">
            <div className="row align-items-center">
              
              {/* Logo PideGas */}
              <div className="col-xl-3 col-6">
                <div className="tp-header-logo-2 p-relative d-flex align-items-center gap-2">
                  <Link href="/" className="d-flex align-items-center gap-2">
                    <img
                      src="/assets/img/logo/logo-black.png"
                      alt="RappiGas"
                      style={{ height: "42px", width: "auto" }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--tp-ff-heading, 'Jost', sans-serif)",
                        fontWeight: 900,
                        fontSize: "26px",
                        color: "#16243E",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Rappi<span style={{ color: "#00A3C3" }}>Gas</span>
                    </span>
                  </Link>
                </div>
              </div>

              {/* Menú Principal */}
              <div className="col-lg-6 d-none d-xl-block">
                <div className="tp-main-menu home-2 d-none d-xl-block">
                  <nav className="tp-main-menu-content">
                    <ul>
                      <li>
                        <Link href="/">Inicio</Link>
                      </li>
                      <li>
                        <Link href="/nosotros">Nosotros</Link>
                      </li>
                      <li className="has-dropdown">
                        <Link href="/productos">Productos</Link>
                        <ul className="submenu">
                          <li>
                            <Link href="/productos">Balón de Gas 10kg</Link>
                          </li>
                          <li>
                            <Link href="/productos">Balón de Gas 15kg</Link>
                          </li>
                          <li>
                            <Link href="/productos">Balón de Gas 45kg</Link>
                          </li>
                          <li>
                            <Link href="/productos">Válvula Click-On</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#cobertura">Cobertura</a>
                      </li>
                      <li>
                        <a href="#proceso">¿Cómo Funciona?</a>
                      </li>
                      <li>
                        <Link href="/contacto">Contacto</Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>

              {/* Botones de Cabecera y Teléfono */}
              <div className="col-xl-3 col-6">
                <div className="tp-header-main-right-2 d-flex align-items-center justify-content-xl-end gap-3">
                  
                  {/* Botón Buscar */}
                  <div className="tp-header-contact-2 d-flex align-items-center">
                    <div
                      className="tp-header-contact-search search-open-btn d-none d-xxl-block"
                      onClick={() => setSearchOpen(true)}
                    >
                      <span>
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </span>
                    </div>

                    {/* Widget Central Telefónica */}
                    <div className="tp-header-contact-inner d-none d-xl-flex align-items-center">
                      <div className="tp-header-contact-icon">
                        <span>
                          <i className="fa-solid fa-phone"></i>
                        </span>
                      </div>
                      <div className="tp-header-contact-content">
                        <p>Central de Pedidos:</p>
                        <span>
                          <a href="tel:0180074334">(01) 800-PIDE</a>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de Cuenta / Pedido */}
                  <div className="d-none d-lg-flex align-items-center gap-2">
                    {autenticadoActivo && usuarioActivo ? (
                      <div className="d-flex align-items-center gap-1">
                        <Link
                          href={getRutaPanel()}
                          className="tp-btn"
                          style={{
                            padding: "10px 22px",
                            fontSize: "13px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <i className="fa-solid fa-user"></i>
                          <span>{getTextoBotonPanel()}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="btn"
                          title="Cerrar sesión"
                          style={{
                            height: "38px",
                            width: "38px",
                            borderRadius: "50%",
                            border: "1px solid #EAEBED",
                            background: "#fff",
                            color: "#dc2626",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <LogOut size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
                        <Link
                          href="/auth/login"
                          className="btn btn-outline-secondary"
                          style={{
                            borderRadius: "45px",
                            fontSize: "13px",
                            fontWeight: 600,
                            padding: "8px 18px",
                            color: "#16243E",
                            borderColor: "#EAEBED",
                          }}
                        >
                          Ingresar
                        </Link>
                        <Link
                          href="/cliente/tienda"
                          className="tp-btn"
                          style={{
                            padding: "10px 22px",
                            fontSize: "13px",
                          }}
                        >
                          Pedir Gas <span><i className="fa-regular fa-plus"></i></span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Botón Hamburguesa Móvil */}
                  <div className="tp-header-main-right-hamburger-btn d-xl-none offcanvas-open-btn text-end">
                    <button
                      className="hamburger-btn"
                      onClick={() => setMenuOpen(true)}
                      aria-label="Abrir menú"
                    >
                      <span></span>
                      <span></span>
                      <span></span>
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Modal de Búsqueda */}
      <div className={`search-area ${searchOpen ? "search-opened" : ""}`}>
        <div className="search-inner p-relative">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="search-wrapper">
                  <div className="search-close">
                    <button
                      className="search-close-btn"
                      onClick={() => setSearchOpen(false)}
                      aria-label="Cerrar búsqueda"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1 1L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="search-content pt-35">
                    <h3 className="heading text-center mb-30" style={{ color: "#16243E" }}>
                      ¿Qué balón o consulta necesitas hoy?
                    </h3>
                    <div className="d-flex justify-content-center px-5">
                      <div className="search w-100 p-relative">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setSearchOpen(false);
                            router.push("/productos");
                          }}
                        >
                          <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar balón de 10kg, válvula click-on, cobertura..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                          />
                          <button className="search-icon" type="submit">
                            <i className="fa fa-search"></i>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`search-overlay ${searchOpen ? "opened" : ""}`}
        onClick={() => setSearchOpen(false)}
      ></div>

      {/* Menú Desplegable Lateral Offcanvas */}
      <div className={`offcanvas__area ${menuOpen ? "offcanvas-opened" : ""}`}>
        <div className="offcanvas__wrapper">
          <div className="offcanvas__close">
            <button
              className="offcanvas__close-btn offcanvas-close-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú móvil"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 1L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="offcanvas__content">
            <div className="offcanvas__top mb-40 d-flex justify-content-between align-items-center">
              <div className="offcanvas__logo logo">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <span
                    style={{
                      fontFamily: "var(--tp-ff-heading, 'Jost', sans-serif)",
                      fontWeight: 900,
                      fontSize: "24px",
                      color: "#16243E",
                    }}
                  >
                    Pide<span style={{ color: "#00A3C3" }}>Gas</span>
                  </span>
                </Link>
              </div>
            </div>

            <div className="tp-main-menu-mobile fix mb-40">
              <nav className="tp-main-menu-content">
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li className="mb-2">
                    <Link href="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/productos" onClick={() => setMenuOpen(false)}>Productos y Balones</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/contacto" onClick={() => setMenuOpen(false)}>Contacto</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/auth/registro-empresa" onClick={() => setMenuOpen(false)}>Afiliar Distribuidora</Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="mb-4">
              <Link
                href="/cliente/tienda"
                onClick={() => setMenuOpen(false)}
                className="tp-btn w-100 text-center d-block mb-2"
              >
                Pedir Balón de Gas
              </Link>
              <Link
                href={getRutaPanel()}
                onClick={() => setMenuOpen(false)}
                className="btn btn-outline-dark w-100 text-center d-block"
                style={{ borderRadius: "45px" }}
              >
                {getTextoBotonPanel()}
              </Link>
            </div>

            <div className="offcanvas__contact">
              <h4 className="offcanvas__title">Central Telefónica</h4>
              <div className="offcanvas__contact-content d-flex mb-2">
                <div className="offcanvas__contact-content-icon me-2">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div className="offcanvas__contact-content-content">
                  <a href="tel:0180074334">(01) 800-PIDE</a>
                </div>
              </div>
              <div className="offcanvas__contact-content d-flex mb-2">
                <div className="offcanvas__contact-content-icon me-2">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <div className="offcanvas__contact-content-content">
                  <a href="mailto:contacto@rappigas.pe">contacto@rappigas.pe</a>
                </div>
              </div>
              <div className="offcanvas__contact-content d-flex">
                <div className="offcanvas__contact-content-icon me-2">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="offcanvas__contact-content-content">
                  <span>Lima y Callao - Perú</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`body-overlay ${menuOpen ? "opened" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>
    </>
  );
}
