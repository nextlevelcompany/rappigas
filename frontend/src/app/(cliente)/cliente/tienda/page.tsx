"use client";

import React, { useEffect, useState, useTransition, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { empresasApi, EmpresaDetalle } from "@/librerias/api/empresas.api";
import { catalogoApi, ProductoDetalle } from "@/librerias/api/catalogo.api";
import { pedidosApi, CrearPedidoDto, PedidoDetalle } from "@/librerias/api/pedidos.api";
import { fidelizacionApi, BilleteraPuntos, ResultadoValidacionCupon } from "@/librerias/api/fidelizacion.api";
import { finanzasApi, MetodoPago } from "@/librerias/api/finanzas.api";
import { ubigeoApi, UbigeoItem } from "@/librerias/api/ubigeo.api";
import {
  obtenerCarritoGas,
  sincronizarCarritoGasDesdeTienda,
  vaciarCarritoGas,
  guardarEmpresaSeleccionada,
  guardarDireccionGas,
} from "@/librerias/carrito-gas";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/librerias/api/auth.api";
import {
  calcularDistanciaKm,
  obtenerCoordenadasDistribuidora,
  obtenerCoordenadasPorUbigeo,
  UBIGEO_COORDENADAS_PERU,
} from "@/librerias/geo-utils";
import {
  Flame,
  MapPin,
  Truck,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  Gift,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Phone,
  Navigation,
  Search,
  Map as MapIcon,
  List as ListIcon,
  ChevronDown,
  Maximize2,
  Minimize2,
  Loader2,
  Trash2,
  Sparkles,
} from "lucide-react";

// Import dinámico de Leaflet con SSR desactivado para evitar errores de window en Next.js
const MapaCoberturaDistribuidores = dynamic(
  () =>
    import("@/components/mapa/mapa-cobertura-distribuidores").then(
      (mod) => mod.MapaCoberturaDistribuidores
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[240px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 animate-pulse border border-slate-200">
        <MapPin className="w-6 h-6 text-orange-500 animate-bounce mb-1" />
        <span className="text-xs font-semibold text-slate-700">
          Cargando mapa interactivo...
        </span>
      </div>
    ),
  }
);

// Límite máximo de cobertura en kilómetros para despacho express de balones
const LIMITE_COBERTURA_KM = 10.0;

export default function TiendaClienteGasPage() {
  const { usuario, establecerSesion } = useAuthStore();
  const [empresas, setEmpresas] = useState<EmpresaDetalle[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaDetalle | null>(null);
  const [catalogo, setCatalogo] = useState<ProductoDetalle[]>([]);
  const [carrito, setCarrito] = useState<{ [productoId: string]: number }>({});
  const [billetera, setBilletera] = useState<BilleteraPuntos | null>(null);

  // Ubicación y Dirección estructurada del cliente
  const [direccionExacta, setDireccionExacta] = useState("Av. Antúnez de Mayolo 1234");
  const [distritoDireccion, setDistritoDireccion] = useState("Los Olivos");
  const [ciudadDireccion, setCiudadDireccion] = useState("Lima");
  const [departamentoDireccion, setDepartamentoDireccion] = useState("Lima");
  const [direccion, setDireccion] = useState("Av. Antúnez de Mayolo 1234, Los Olivos, Lima");
  const [referencia, setReferencia] = useState("A 2 cuadras de la municipalidad");
  const [latitud, setLatitud] = useState(-11.9912);
  const [longitud, setLongitud] = useState(-77.0711);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("YAPE");
  const [telefonoYape, setTelefonoYape] = useState("977665554");
  const [notas, setNotas] = useState("Balón para cocina doméstica con precinto intacto.");

  // Buscador por Distritos (Ubigeo Perú)
  const [mostrarBuscadorUbigeo, setMostrarBuscadorUbigeo] = useState(false);
  const [departamentosList, setDepartamentosList] = useState<string[]>([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("LIMA");
  const [provinciasList, setProvinciasList] = useState<string[]>([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("LIMA");
  const [distritosList, setDistritosList] = useState<UbigeoItem[]>([]);
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<UbigeoItem | null>(null);
  const [ubigeoActivo, setUbigeoActivo] = useState<UbigeoItem | null>({
    id: 17,
    codigoInei: "150117",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LOS OLIVOS",
  });
  const [cargandoUbigeo, setCargandoUbigeo] = useState(false);
  const [errorUbigeo, setErrorUbigeo] = useState<string | null>(null);

  // Cupones
  const [codigoCupon, setCodigoCupon] = useState("GASPRIMERO");
  const [cuponAplicado, setCuponAplicado] = useState<ResultadoValidacionCupon | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);
  const [errorCupon, setErrorCupon] = useState<string | null>(null);

  // Estados de interfaz y filtrado de mapa
  const [vistaModo, setVistaModo] = useState<"mapa" | "lista">("mapa");
  const [vistaPrincipal, setVistaPrincipal] = useState<"catalogo" | "mapa">("catalogo");
  const [filtroTipoGas, setFiltroTipoGas] = useState<string>("TODOS");
  const [mapaExpandido, setMapaExpandido] = useState(false);
  const [busquedaDistribuidor, setBusquedaDistribuidor] = useState("");
  const [filtroMarca, setFiltroMarca] = useState<string>("TODAS");
  const [mensajeGps, setMensajeGps] = useState<string | null>(null);

  // Estados de proceso
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoDetalle | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  useEffect(() => {
    cargarDatosIniciales();
    cargarDepartamentosUbigeo();
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    try {
      const emps = await empresasApi.listarEmpresasPublicas();
      setEmpresas(emps);

      if (emps.length > 0) {
        const inicial =
          emps.find((e) => e.nombreComercial.toLowerCase().includes("solgas")) ||
          emps[0];
        setEmpresaSeleccionada(inicial);

        try {
          const prods = await catalogoApi.listarProductosPublicos(inicial.publicId);
          const activos = prods.filter((p) => p.estado === "ACTIVO");
          setCatalogo(activos);
          const gasGuardado = obtenerCarritoGas();
          const mapGuardado: { [id: string]: number } = {};
          activos.forEach((p) => {
            const match = gasGuardado.find((it) => it.producto.publicId === p.publicId);
            if (match && match.cantidad > 0) {
              mapGuardado[p.publicId] = match.cantidad;
            }
          });
          if (Object.keys(mapGuardado).length > 0) {
            setCarrito(mapGuardado);
          } else if (activos.length > 0) {
            setCarrito({ [activos[0].publicId]: 1 });
          }
        } catch {
          // Si el catálogo falla, se gestiona en UI
        }
      }

      try {
        const b = await fidelizacionApi.obtenerBilletera();
        setBilletera(b);
      } catch {
        // No logueado o rol distinto
      }
    } catch {
      // Ignorar errores en carga inicial
    } finally {
      setCargando(false);
    }
  };

  const cargarDepartamentosUbigeo = async () => {
    try {
      const deps = await ubigeoApi.listarDepartamentos();
      setDepartamentosList(deps);
      if (deps.includes("LIMA")) {
        setDepartamentoSeleccionado("LIMA");
        const provs = await ubigeoApi.listarProvincias("LIMA");
        setProvinciasList(provs);
        if (provs.includes("LIMA")) {
          setProvinciaSeleccionada("LIMA");
          const dists = await ubigeoApi.listarDistritos("LIMA", "LIMA");
          setDistritosList(dists);
          const losOlivos = dists.find((d) => d.codigoInei === "150117") || dists[0];
          setDistritoSeleccionado(losOlivos || null);
        }
      }
    } catch (e) {
      console.warn("Ubigeo inicial no cargado:", e);
    }
  };

  const handleCambiarDepartamento = async (dep: string) => {
    setDepartamentoSeleccionado(dep);
    setCargandoUbigeo(true);
    setErrorUbigeo(null);
    try {
      const provs = await ubigeoApi.listarProvincias(dep);
      setProvinciasList(provs);
      if (provs.length > 0) {
        setProvinciaSeleccionada(provs[0]);
        const dists = await ubigeoApi.listarDistritos(dep, provs[0]);
        setDistritosList(dists);
        setDistritoSeleccionado(dists.length > 0 ? dists[0] : null);
      } else {
        setProvinciasList([]);
        setDistritosList([]);
        setDistritoSeleccionado(null);
      }
    } catch (err: any) {
      setErrorUbigeo("Error: " + (err.message || "Error"));
    } finally {
      setCargandoUbigeo(false);
    }
  };

  const handleCambiarProvincia = async (prov: string) => {
    setProvinciaSeleccionada(prov);
    setCargandoUbigeo(true);
    setErrorUbigeo(null);
    try {
      const dists = await ubigeoApi.listarDistritos(departamentoSeleccionado, prov);
      setDistritosList(dists);
      setDistritoSeleccionado(dists.length > 0 ? dists[0] : null);
    } catch (err: any) {
      setErrorUbigeo("Error: " + (err.message || "Error"));
    } finally {
      setCargandoUbigeo(false);
    }
  };

  const handleAplicarUbigeoCascada = () => {
    if (!distritoSeleccionado) {
      setErrorUbigeo("Selecciona un distrito válido.");
      return;
    }
    const coords = obtenerCoordenadasPorUbigeo(
      distritoSeleccionado.codigoInei,
      distritoSeleccionado.departamento,
      distritoSeleccionado.distrito
    );
    setLatitud(coords.lat);
    setLongitud(coords.lng);
    setDistritoDireccion(distritoSeleccionado.distrito);
    setCiudadDireccion(distritoSeleccionado.provincia);
    setDepartamentoDireccion(distritoSeleccionado.departamento);
    setDireccion(
      `${distritoSeleccionado.distrito}, ${distritoSeleccionado.provincia}`
    );
    setUbigeoActivo(distritoSeleccionado);
    setMensajeGps(`Ubicación fijada en ${distritoSeleccionado.distrito}`);
    setTimeout(() => setMensajeGps(null), 3500);
    setMostrarBuscadorUbigeo(false);
  };

  // Buscar dirección exacta escrita en el input (sin GPS)
  const handleBuscarDireccionExacta = async () => {
    const query = direccion.trim();
    if (!query) {
      setMensajeGps("Escribe una dirección para buscar.");
      setTimeout(() => setMensajeGps(null), 3000);
      return;
    }

    setBuscandoDireccion(true);
    setMensajeGps("Buscando dirección exacta en el mapa...");

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ", Perú"
      )}&limit=1&countrycodes=pe`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const nLat = parseFloat(item.lat);
        const nLng = parseFloat(item.lon);
        if (!isNaN(nLat) && !isNaN(nLng)) {
          setLatitud(nLat);
          setLongitud(nLng);
          const parts = item.display_name.split(",").map((s: string) => s.trim());
          if (parts.length > 0) setDireccionExacta(parts[0]);
          if (parts.length > 1) setDistritoDireccion(parts[1]);
          if (parts.length > 2) setCiudadDireccion(parts[2]);
          if (parts.length > 3) setDepartamentoDireccion(parts[3]);
          setMensajeGps(`¡Dirección ubicada: ${parts.slice(0, 2).join(", ")}!`);
          setTimeout(() => setMensajeGps(null), 4000);
          return;
        }
      }
      throw new Error("No encontrado en línea");
    } catch {
      const queryUpper = query.toUpperCase();
      let encontrado = false;

      for (const [ubigeo, info] of Object.entries(UBIGEO_COORDENADAS_PERU)) {
        const nombreNorm = info.nombre.toUpperCase();
        if (
          queryUpper.includes(nombreNorm) ||
          (nombreNorm.includes(" ") && queryUpper.includes(nombreNorm.split(" ")[0]))
        ) {
          setLatitud(info.lat);
          setLongitud(info.lng);
          setDistritoDireccion(info.nombre);
          setCiudadDireccion("Lima");
          setDepartamentoDireccion("Lima");
          setUbigeoActivo({
            id: 0,
            codigoInei: ubigeo,
            distrito: info.nombre.toUpperCase(),
            provincia: "LIMA",
            departamento: "LIMA",
          });
          setMensajeGps(`¡Ubicado en distrito de ${info.nombre}!`);
          setTimeout(() => setMensajeGps(null), 4000);
          encontrado = true;
          break;
        }
      }

      if (!encontrado) {
        setMensajeGps(
          "No se pudo ubicar con exactitud. Selecciona tu distrito en el botón 'Distritos'."
        );
        setTimeout(() => setMensajeGps(null), 4500);
      }
    } finally {
      setBuscandoDireccion(false);
    }
  };

  const cambiarEmpresa = async (emp: EmpresaDetalle) => {
    setEmpresaSeleccionada(emp);
    setCarrito({});
    setCuponAplicado(null);
    try {
      const prods = await catalogoApi.listarProductosPublicos(emp.publicId);
      const activos = prods.filter((p) => p.estado === "ACTIVO");
      setCatalogo(activos);
      if (activos.length > 0) {
        setCarrito({ [activos[0].publicId]: 1 });
      }
    } catch {
      setCatalogo([]);
    }
  };

  // Función para limpiar o deseleccionar la distribuidora
  const handleLimpiarDistribuidora = () => {
    setEmpresaSeleccionada(null);
    setCarrito({});
    setCatalogo([]);
    setCuponAplicado(null);
    setErrorEnvio(null);
  };

  const distribuidoresConDistancia = useMemo(() => {
    return empresas
      .map((emp, idx) => {
        const coords = obtenerCoordenadasDistribuidora(
          emp,
          latitud,
          longitud,
          idx,
          empresas.length
        );
        const distanciaKm = calcularDistanciaKm(
          latitud,
          longitud,
          coords.lat,
          coords.lng
        );
        const tiempoMin = Math.max(15, Math.round(distanciaKm * 6 + 12));
        const tiempoMax = Math.max(25, Math.round(distanciaKm * 6 + 22));
        const tieneCoberturaDirecta =
          Boolean(emp.tieneCoberturaDirecta) || distanciaKm <= 6.0;
        const estaSinCobertura = distanciaKm > LIMITE_COBERTURA_KM;

        return {
          ...emp,
          coords,
          distanciaKm,
          tiempoMin,
          tiempoMax,
          tieneCoberturaDirecta,
          estaSinCobertura,
        };
      })
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [empresas, latitud, longitud]);

  const catalogoFiltrado = useMemo(() => {
    if (filtroTipoGas === "TODOS") return catalogo;
    return catalogo.filter((p) => p.tipoGas === filtroTipoGas);
  }, [catalogo, filtroTipoGas]);

  const distribuidoresFiltrados = useMemo(() => {
    return distribuidoresConDistancia.filter((emp) => {
      const matchBusqueda =
        !busquedaDistribuidor.trim() ||
        emp.nombreComercial
          .toLowerCase()
          .includes(busquedaDistribuidor.toLowerCase()) ||
        (emp.direccionFiscal &&
          emp.direccionFiscal
            .toLowerCase()
            .includes(busquedaDistribuidor.toLowerCase())) ||
        (emp.zonaNombre &&
          emp.zonaNombre
            .toLowerCase()
            .includes(busquedaDistribuidor.toLowerCase()));

      const matchMarca =
        filtroMarca === "TODAS" ||
        emp.nombreComercial.toUpperCase().includes(filtroMarca) ||
        (emp.direccionFiscal &&
          emp.direccionFiscal.toUpperCase().includes(filtroMarca));

      return matchBusqueda && matchMarca;
    });
  }, [distribuidoresConDistancia, busquedaDistribuidor, filtroMarca]);

  const handleUsarGps = () => {
    if (!navigator.geolocation) {
      setMensajeGps("GPS no disponible.");
      return;
    }
    setMensajeGps("Detectando GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitud(lat);
        setLongitud(lng);
        setDireccion(`GPS (${lat}, ${lng})`);
        setUbigeoActivo(null);
        setMensajeGps("¡Ubicación fijada por GPS!");
        setTimeout(() => setMensajeGps(null), 3000);
      },
      (err) => {
        setMensajeGps("Error GPS: " + err.message);
        setTimeout(() => setMensajeGps(null), 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Mapeador de imagen oficial para cada tipo de balón o accesorio
  const obtenerImagenProducto = (prod: ProductoDetalle): string => {
    if (prod.imagenUrl && prod.imagenUrl.trim() !== "") {
      const url = prod.imagenUrl.trim();
      if (url.startsWith("/api/v1/archivos/ver/")) {
        return `http://localhost:8080${url}`;
      }
      return url;
    }
    if (prod.tipoGas === "GLP_10KG") {
      return prod.tipoValvula === "ROSCA"
        ? "/products/balon-10kg-rosca.svg"
        : "/products/balon-10kg-premium.svg";
    }
    if (prod.tipoGas === "GLP_15KG") {
      return "/products/balon-15kg-premium.svg";
    }
    if (prod.tipoGas === "GLP_45KG") {
      return "/products/balon-45kg-industrial.svg";
    }
    if (prod.tipoGas === "VALVULA_ACCESORIO") {
      return "/products/regulador-manometro.svg";
    }
    return "/products/balon-10kg-premium.svg";
  };

  const modificarCantidad = (publicId: string, delta: number) => {
    setCarrito((prev) => {
      const actual = prev[publicId] || 0;
      const nuevo = Math.max(0, actual + delta);
      if (nuevo === 0) {
        const copia = { ...prev };
        delete copia[publicId];
        return copia;
      }
      return { ...prev, [publicId]: nuevo };
    });
  };

  // Sincronizar carrito local hacia almacenamiento global de RappiGas
  useEffect(() => {
    if (catalogo.length > 0) {
      sincronizarCarritoGasDesdeTienda(carrito, catalogo, empresaSeleccionada);
    }
  }, [carrito, catalogo, empresaSeleccionada]);

  // Persistir empresa seleccionada
  useEffect(() => {
    if (empresaSeleccionada) {
      guardarEmpresaSeleccionada(empresaSeleccionada);
    }
  }, [empresaSeleccionada]);

  // Persistir dirección y coordenadas seleccionadas para el checkout
  useEffect(() => {
    guardarDireccionGas({
      direccionExacta,
      distrito: distritoDireccion,
      ciudad: ciudadDireccion,
      departamento: departamentoDireccion,
      referencia,
      latitud,
      longitud,
      telefono: telefonoYape,
      notas,
    });
  }, [
    direccionExacta,
    distritoDireccion,
    ciudadDireccion,
    departamentoDireccion,
    referencia,
    latitud,
    longitud,
    telefonoYape,
    notas,
  ]);

  // Escuchar actualizaciones del carrito de gas realizadas desde el header
  useEffect(() => {
    const handleSyncDesdeHeader = () => {
      const items = obtenerCarritoGas();
      const nuevoMap: { [id: string]: number } = {};
      items.forEach((it) => {
        nuevoMap[it.producto.publicId] = it.cantidad;
      });
      setCarrito((prev) => {
        const prevKeys = Object.keys(prev);
        const newKeys = Object.keys(nuevoMap);
        if (
          prevKeys.length === newKeys.length &&
          prevKeys.every((k) => prev[k] === nuevoMap[k])
        ) {
          return prev;
        }
        return nuevoMap;
      });
    };
    window.addEventListener("carrito_gas_actualizado", handleSyncDesdeHeader);
    return () => window.removeEventListener("carrito_gas_actualizado", handleSyncDesdeHeader);
  }, []);

  const calcularSubtotal = () => {
    return Object.entries(carrito).reduce((total, [publicId, cant]) => {
      const prod = catalogo.find((p) => p.publicId === publicId);
      return total + (prod ? prod.precio * cant : 0);
    }, 0);
  };

  const subtotal = calcularSubtotal();
  const descuento = cuponAplicado?.valido ? cuponAplicado.descuento : 0;
  const totalPagar = Math.max(0, subtotal - descuento);

  const handleValidarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setValidandoCupon(true);
    setErrorCupon(null);
    try {
      const res = await fidelizacionApi.validarCupon(
        codigoCupon.trim().toUpperCase(),
        subtotal > 0 ? subtotal : 50.0,
        empresaSeleccionada?.publicId
      );
      if (res.valido) {
        setCuponAplicado(res);
      } else {
        setErrorCupon(res.mensaje || "Cupón inválido.");
        setCuponAplicado(null);
      }
    } catch (err: any) {
      setErrorCupon("Error al validar: " + (err.message || "Error"));
    } finally {
      setValidandoCupon(false);
    }
  };

  const distribuidoraActiva = distribuidoresConDistancia.find(
    (d) => d.publicId === empresaSeleccionada?.publicId
  );

  // Verificación de cobertura
  const distribuidoraSinCobertura = distribuidoraActiva
    ? distribuidoraActiva.distanciaKm > LIMITE_COBERTURA_KM
    : false;

  const handleConfirmarPedido = () => {
    if (!empresaSeleccionada) {
      setErrorEnvio("Por favor selecciona una distribuidora autorizada en el mapa.");
      return;
    }
    if (distribuidoraSinCobertura) {
      setErrorEnvio(
        `La distribuidora ${empresaSeleccionada.nombreComercial} está a ${distribuidoraActiva?.distanciaKm} km (fuera del límite de cobertura de ${LIMITE_COBERTURA_KM} km). Por favor selecciona una distribuidora más cercana.`
      );
      return;
    }
    if (Object.keys(carrito).length === 0) {
      setErrorEnvio("Selecciona al menos un balón de gas para continuar.");
      return;
    }

    startTransition(async () => {
      setErrorEnvio(null);
      try {
        if (!usuario || usuario.rol !== "CLIENTE") {
          const authRes = await authApi.login({
            email: "cliente@pidegas.pe",
            password: "ClientePassword123!",
          });
          establecerSesion(authRes);
        }

        const itemsPayload = Object.entries(carrito).map(([prodId, cant]) => ({
          productoPublicId: prodId,
          cantidad: cant,
        }));

        // Dirección completa estructurada
        const direccionFinal = `${direccionExacta.trim()}, ${distritoDireccion.trim()}, ${ciudadDireccion.trim()}, ${departamentoDireccion.trim()}`;

        const payload: CrearPedidoDto = {
          empresaPublicId: empresaSeleccionada.publicId,
          direccionEntrega: direccionFinal,
          referenciaDireccion: referencia,
          latitud: latitud,
          longitud: longitud,
          metodoPago: metodoPago,
          notasCliente: notas,
          items: itemsPayload,
        };

        const nuevoPed = await pedidosApi.crearPedido(payload);

        if (metodoPago === "YAPE" || metodoPago === "PLIN" || metodoPago === "TARJETA") {
          try {
            await finanzasApi.procesarPagoCliente({
              pedidoPublicId: nuevoPed.publicId,
              metodoPago: metodoPago,
              telefonoYapePlin: telefonoYape,
              nombreTitular: "Cliente RappiGas",
            });
            nuevoPed.estadoPago = "PAGADO";
          } catch (pagoErr) {
            console.warn("Pago diferido:", pagoErr);
          }
        }

        setPedidoConfirmado(nuevoPed);
        setCarrito({});
        vaciarCarritoGas();
        setCuponAplicado(null);
      } catch (err: any) {
        setErrorEnvio(err.message || "Error al procesar el pedido.");
      }
    });
  };

  return (
    <div className="w-full py-2.5 px-3 sm:px-4 space-y-3 text-xs text-slate-800">
      {/* Barra Superior Compacta */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl px-3.5 py-2 text-white shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none">
                RappiGas • Tienda Oficial
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Osinergmin Garantizado
              </span>
            </div>
            <p className="text-[10px] text-orange-100 hidden sm:block mt-0.5">
              Balones certificados con entrega express a tu puerta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold">
          {/* Ubicación Actual Compacta */}
          <div className="flex items-center gap-1.5 bg-black/20 border border-white/20 px-2.5 py-1 rounded-xl text-[10px] text-white font-bold">
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[200px]">
              {distritoDireccion ? `${distritoDireccion}, ${departamentoDireccion}` : "Los Olivos, Lima"}
            </span>
          </div>

          {/* Badge Destacado de Puntos RappiGas */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 text-amber-950 px-3 py-1 rounded-xl shadow-md border-2 border-white/70 font-black shrink-0 hover:scale-105 transition cursor-default">
            <Sparkles className="w-4 h-4 text-amber-900 fill-amber-900 animate-pulse shrink-0" />
            <div className="flex items-center gap-1 leading-none">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900">Puntos:</span>
              <span className="text-xs font-black text-amber-950 bg-white/80 px-1.5 py-0.5 rounded shadow-2xs font-mono">
                {billetera ? Number(billetera.saldoPuntos).toLocaleString() : "0"} PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta Informativa Destacada: Mi Ubicación o Dirección Actual */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 border border-orange-200">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                Mi Ubicación Actual de Entrega
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                GPS: {latitud.toFixed(4)}, {longitud.toFixed(4)}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-black text-slate-900 truncate">
              {direccion || `${direccionExacta}, ${distritoDireccion}, ${ciudadDireccion}`}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
              <span><strong>Distrito:</strong> {distritoDireccion}</span>
              <span>•</span>
              <span><strong>Provincia/Ciudad:</strong> {ciudadDireccion}</span>
              <span>•</span>
              <span><strong>Departamento:</strong> {departamentoDireccion}</span>
              {referencia && (
                <>
                  <span>•</span>
                  <span className="italic text-slate-400 truncate max-w-xs">Ref: {referencia}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Acciones Rápidas sobre la Ubicación */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleUsarGps}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs transition cursor-pointer shadow-2xs"
            title="Detectar por GPS actual"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Actualizar GPS</span>
          </button>
        </div>
      </div>

      {/* Modal de Éxito cuando el pedido se confirma */}
      {pedidoConfirmado && (
        <div className="bg-emerald-50 border border-emerald-500 rounded-2xl p-4 shadow-md space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  ¡Pedido Confirmado!
                </span>
                <h2 className="text-base font-black text-emerald-950">
                  Orden #PG-{pedidoConfirmado.publicId.substring(0, 8).toUpperCase()}
                </h2>
              </div>
            </div>
            <button
              onClick={() => setPedidoConfirmado(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-1.5 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="bg-white rounded-xl p-2.5 border border-emerald-200 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">
                Código para el Repartidor:
              </p>
              <p className="text-[10px] text-slate-500">Muéstralo al recibir el balón</p>
            </div>
            <div className="px-3 py-1 bg-orange-50 border border-orange-500 rounded-lg text-lg font-mono font-black text-orange-600 tracking-wider">
              {pedidoConfirmado.codigoConfirmacion}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] pt-1">
            <span className="text-emerald-800">
              Total: <strong>S/ {Number(pedidoConfirmado.total).toFixed(2)}</strong> ({pedidoConfirmado.metodoPago})
            </span>
            <a
              href="/cliente/pedidos"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              Ver Seguimiento
            </a>
          </div>
        </div>
      )}

      {/* Grid Principal: 2 columnas compactas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Columna Izquierda: Mapa + Distribuidores + Catálogo */}
        <div className="lg:col-span-2 space-y-3">
          {/* Selector de Vista: Catálogo Directo (Default) vs Mapa y Distribuidores */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setVistaPrincipal("catalogo")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  vistaPrincipal === "catalogo"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Flame className="w-4 h-4 text-amber-300" />
                Catálogo de Balones
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  vistaPrincipal === "catalogo" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {catalogo.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVistaPrincipal("mapa")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  vistaPrincipal === "mapa"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <MapIcon className="w-4 h-4 text-amber-300" />
                Ver Mapa y Plantas
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  vistaPrincipal === "mapa" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {distribuidoresFiltrados.length}
                </span>
              </button>
            </div>

            {/* Planta Asignada */}
            {distribuidoraActiva && (
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-[10px] text-slate-400">Planta Asignada:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[140px]">
                    {distribuidoraActiva.nombreComercial}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    ⚡ {distribuidoraActiva.tiempoMin}-{distribuidoraActiva.tiempoMax} min
                  </span>
                </div>
                {vistaPrincipal === "catalogo" && (
                  <button
                    type="button"
                    onClick={() => setVistaPrincipal("mapa")}
                    className="text-[11px] text-orange-600 font-bold hover:underline shrink-0"
                  >
                    Cambiar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* VISTA 1: CATÁLOGO DE PRODUCTOS (PRODUCT-FIRST) */}
          {vistaPrincipal === "catalogo" && (
            <div className="space-y-3">
              {/* Filtros Rápidos por Categoría */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "TODOS", label: "🔥 Todos los Balones" },
                  { id: "GLP_10KG", label: "🏠 10kg Doméstico" },
                  { id: "GLP_15KG", label: "🏢 15kg Comercial" },
                  { id: "GLP_45KG", label: "🏭 45kg Industrial" },
                  { id: "VALVULA_ACCESORIO", label: "🛡️ Válvulas y Reguladores" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltroTipoGas(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                      filtroTipoGas === tab.id
                        ? "bg-orange-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

                        {/* SECCIÓN DEL CATÁLOGO DE BALONES DE GAS */}
          <div id="seccion-catalogo" className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-600" />
                <h2 className="text-xs sm:text-sm font-black text-slate-900">
                  Balones de Gas Disponibles
                </h2>
                <span className="text-[10px] text-slate-500">
                  ({empresaSeleccionada?.nombreComercial || "Ninguna distribuidora seleccionada"})
                </span>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                {catalogoFiltrado.length} cilindros
              </span>
            </div>

            {!empresaSeleccionada ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1.5">
                <ShoppingBag className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  Ninguna distribuidora seleccionada
                </p>
                <p className="text-[11px] text-slate-500">
                  Haz clic en cualquier distribuidora en el mapa para cargar sus balones disponibles.
                </p>
              </div>
            ) : catalogoFiltrado.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center space-y-1.5">
                <AlertCircle className="w-5 h-5 text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900">
                  No hay balones en el catálogo de esta distribuidora
                </p>
                <p className="text-[11px] text-amber-700">
                  Prueba seleccionando <strong>Solgas Los Olivos</strong> u otra distribuidora en el mapa.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {catalogoFiltrado.map((prod) => {
                  const cantidad = carrito[prod.publicId] || 0;
                  const imgUrl = obtenerImagenProducto(prod);
                  return (
                    <div
                      key={prod.publicId}
                      className={`bg-white rounded-xl border p-2.5 shadow-2xs transition flex flex-col justify-between group ${
                        cantidad > 0
                          ? "border-orange-500 ring-1 ring-orange-300 bg-orange-50/10"
                          : "border-slate-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Contenedor de Imagen con Efecto Hover Zoom Flotante */}
                        <div className="relative group/zoom shrink-0">
                          {/* Miniatura */}
                          <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-slate-50 to-orange-50/40 border border-slate-200/90 p-1 flex items-center justify-center shadow-2xs transition-all duration-200 cursor-zoom-in hover:border-orange-400 hover:shadow-md">
                            <img
                              src={imgUrl}
                              alt={prod.nombre}
                              className="h-12 w-auto max-w-full object-contain drop-shadow-xs transition-transform duration-200 group-hover/zoom:scale-110"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "/products/balon-10kg-premium.svg";
                              }}
                            />
                          </div>

                          {/* Vista Ampliada Flotante al pasar el cursor */}
                          <div className="absolute left-14 -top-3 z-[60] pointer-events-none opacity-0 invisible group-hover/zoom:opacity-100 group-hover/zoom:visible transition-all duration-200 transform scale-95 group-hover/zoom:scale-100">
                            <div className="w-52 bg-white rounded-2xl border-2 border-orange-400 p-2.5 shadow-2xl space-y-1.5 backdrop-blur-md">
                              <div className="w-full h-44 bg-gradient-to-b from-slate-50 via-white to-orange-50/30 rounded-xl p-2 flex items-center justify-center border border-slate-100">
                                <img
                                  src={imgUrl}
                                  alt={prod.nombre}
                                  className="h-40 w-auto max-w-full object-contain drop-shadow-md"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      "/products/balon-10kg-premium.svg";
                                  }}
                                />
                              </div>
                              <div className="text-center px-1">
                                <p className="font-black text-slate-900 text-xs leading-snug line-clamp-1">
                                  {prod.nombre}
                                </p>
                                <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px]">
                                  <span className="font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                                    S/ {Number(prod.precio).toFixed(2)}
                                  </span>
                                  <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                    {prod.tipoValvula}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-bold text-slate-900 text-xs truncate">
                              {prod.nombre}
                            </h3>
                            <span className="text-xs sm:text-sm font-black text-slate-900 shrink-0">
                              S/ {Number(prod.precio).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {prod.descripcion}
                          </p>
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {prod.tipoValvula}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-100">
                              {prod.tipoGas}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] text-emerald-700 font-semibold">
                          ✓ Garantía Oficial
                        </span>
                        <div className="flex items-center gap-1">
                          {cantidad > 0 ? (
                            <div className="flex items-center gap-1.5 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">
                              <button
                                type="button"
                                onClick={() => modificarCantidad(prod.publicId, -1)}
                                className="w-5 h-5 rounded bg-white shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-xs w-4 text-center text-slate-900">
                                {cantidad}
                              </span>
                              <button
                                type="button"
                                onClick={() => modificarCantidad(prod.publicId, 1)}
                                className="w-5 h-5 rounded bg-orange-600 text-white shadow-2xs flex items-center justify-center hover:bg-orange-700 font-bold cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => modificarCantidad(prod.publicId, 1)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

              {/* Banner de Garantía y Confianza */}
              <div className="p-3 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-2xl border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Pesaje garantizado en puerta:</strong> Cada cilindro se entrega con precinto de seguridad Osinergmin intacto y verificación en balanza digital.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVistaPrincipal("mapa")}
                  className="text-orange-600 font-bold hover:underline whitespace-nowrap shrink-0 text-[11px]"
                >
                  🗺️ Ver mapa de plantas
                </button>
              </div>
            </div>
          )}

          {/* VISTA 2: MAPA INTERACTIVO Y DISTRIBUIDORES */}
          {vistaPrincipal === "mapa" && (
            <div className="space-y-3 animate-in fade-in duration-150">
                        {/* Tarjeta del Mapa y Localización */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 space-y-2.5">
            {/* Barra de Ubicación: Input + Buscar + GPS + Distritos */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
              <div className="flex-1 relative flex items-center">
                <MapPin className="w-3.5 h-3.5 text-orange-500 absolute left-2.5 shrink-0" />
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value);
                    setDireccionExacta(e.target.value.split(",")[0] || e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleBuscarDireccionExacta();
                  }}
                  placeholder="Escribe tu dirección exacta (ej. Av. Larco 880, Miraflores)..."
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Botón Buscar Dirección Exacta */}
                <button
                  type="button"
                  onClick={handleBuscarDireccionExacta}
                  disabled={buscandoDireccion}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-xs transition cursor-pointer shrink-0"
                  title="Buscar coordenadas exactas de la dirección escrita"
                >
                  {buscandoDireccion ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>{buscandoDireccion ? "Buscando..." : "Buscar"}</span>
                </button>

                {/* Botón GPS */}
                <button
                  type="button"
                  onClick={handleUsarGps}
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition cursor-pointer shrink-0"
                  title="Detectar ubicación GPS"
                >
                  <Navigation className="w-3 h-3" />
                  <span>GPS</span>
                </button>

                {/* Botón Selector de Distritos */}
                <button
                  type="button"
                  onClick={() => setMostrarBuscadorUbigeo(!mostrarBuscadorUbigeo)}
                  className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 font-bold rounded-lg text-xs shadow-xs transition cursor-pointer border shrink-0 ${
                    mostrarBuscadorUbigeo
                      ? "bg-rose-600 text-white border-rose-700"
                      : "bg-white hover:bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                  title="Seleccionar distrito de entrega"
                >
                  <span>🇵🇪</span>
                  <span>Distritos</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      mostrarBuscadorUbigeo ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {mensajeGps && (
              <div className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 flex items-center justify-between">
                <span>{mensajeGps}</span>
                <button
                  type="button"
                  onClick={() => setMensajeGps(null)}
                  className="text-blue-500 hover:text-blue-700 text-[10px] ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Selector Desplegable ÚNICAMENTE de Distritos */}
            {mostrarBuscadorUbigeo && (
              <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-2.5 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950">
                    <span>🇵🇪</span>
                    <span>Seleccionar Distrito de Entrega</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarBuscadorUbigeo(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                      Departamento
                    </label>
                    <select
                      value={departamentoSeleccionado}
                      onChange={(e) => handleCambiarDepartamento(e.target.value)}
                      className="w-full p-1.5 text-[11px] bg-white border border-rose-200 rounded-lg font-semibold text-slate-800 focus:outline-hidden"
                    >
                      {departamentosList.map((dep) => (
                        <option key={dep} value={dep}>
                          {dep}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                      Provincia / Ciudad
                    </label>
                    <select
                      value={provinciaSeleccionada}
                      onChange={(e) => handleCambiarProvincia(e.target.value)}
                      disabled={cargandoUbigeo || provinciasList.length === 0}
                      className="w-full p-1.5 text-[11px] bg-white border border-rose-200 rounded-lg font-semibold text-slate-800 focus:outline-hidden disabled:opacity-50"
                    >
                      {provinciasList.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                      Distrito
                    </label>
                    <select
                      value={distritoSeleccionado?.codigoInei || ""}
                      onChange={(e) => {
                        const item = distritosList.find(
                          (d) => d.codigoInei === e.target.value
                        );
                        if (item) setDistritoSeleccionado(item);
                      }}
                      disabled={cargandoUbigeo || distritosList.length === 0}
                      className="w-full p-1.5 text-[11px] bg-white border border-rose-200 rounded-lg font-semibold text-slate-800 focus:outline-hidden disabled:opacity-50"
                    >
                      {distritosList.map((dist) => (
                        <option key={dist.codigoInei} value={dist.codigoInei}>
                          {dist.distrito}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    Centra el mapa en el distrito seleccionado
                  </span>
                  <button
                    type="button"
                    onClick={handleAplicarUbigeoCascada}
                    disabled={!distritoSeleccionado || cargandoUbigeo}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    Aplicar Distrito
                  </button>
                </div>

                {errorUbigeo && (
                  <p className="text-[10px] text-red-600 font-medium">{errorUbigeo}</p>
                )}
              </div>
            )}

            {/* Sub-barra de Filtros y Selector de Vista */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5 border-t border-slate-100">
              <div className="flex items-center gap-1 flex-1 max-w-xs relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busquedaDistribuidor}
                  onChange={(e) => setBusquedaDistribuidor(e.target.value)}
                  placeholder="Filtrar distribuidora..."
                  className="w-full pl-6 pr-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {["TODAS", "SOLGAS", "ZETA", "LLAMAGAS"].map((marca) => (
                  <button
                    key={marca}
                    type="button"
                    onClick={() => setFiltroMarca(marca)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                      filtroMarca === marca
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {marca}
                  </button>
                ))}
              </div>

              {/* Botón Mapa / Lista y Expandir */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setVistaModo("mapa")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    vistaModo === "mapa" ? "bg-white text-orange-600 shadow-2xs" : "text-slate-600"
                  }`}
                  title="Ver Mapa"
                >
                  <MapIcon className="w-3 h-3 inline mr-0.5" />
                  Mapa
                </button>
                <button
                  type="button"
                  onClick={() => setVistaModo("lista")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    vistaModo === "lista" ? "bg-white text-orange-600 shadow-2xs" : "text-slate-600"
                  }`}
                  title="Ver Lista"
                >
                  <ListIcon className="w-3 h-3 inline mr-0.5" />
                  ({distribuidoresFiltrados.length})
                </button>
                {vistaModo === "mapa" && (
                  <button
                    type="button"
                    onClick={() => setMapaExpandido(!mapaExpandido)}
                    className="p-1 rounded text-slate-500 hover:text-slate-800"
                    title={mapaExpandido ? "Compactar mapa" : "Ampliar mapa"}
                  >
                    {mapaExpandido ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            {/* Vista del Mapa Compacto */}
            {vistaModo === "mapa" && (
              <div
                className={`w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative transition-all duration-200 ${
                  mapaExpandido ? "h-[360px]" : "h-[220px] sm:h-[240px]"
                }`}
              >
                <MapaCoberturaDistribuidores
                  latCliente={latitud}
                  lngCliente={longitud}
                  direccionCliente={direccion}
                  distribuidoras={distribuidoresFiltrados}
                  distribuidoraSeleccionadaId={empresaSeleccionada?.publicId}
                  onSeleccionarDistribuidora={cambiarEmpresa}
                  permitirMoverCliente={true}
                  onCambiarUbicacionCliente={(lat, lng) => {
                    setLatitud(lat);
                    setLongitud(lng);
                  }}
                />
              </div>
            )}

            {/* Distribuidora Activa: Ribbon Compacto con Estado de Cobertura */}
            {distribuidoraActiva && (
              <div
                className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                  distribuidoraSinCobertura
                    ? "bg-red-50/80 border-red-300"
                    : "bg-orange-50 border-orange-300"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold shrink-0 ${
                      distribuidoraSinCobertura ? "bg-red-600" : "bg-orange-600"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-200" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {distribuidoraActiva.nombreComercial}
                      </span>
                      {distribuidoraSinCobertura ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          Sin Cobertura ({distribuidoraActiva.distanciaKm} km)
                        </span>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            ⚡ {distribuidoraActiva.tiempoMin}-{distribuidoraActiva.tiempoMax} min
                          </span>
                          <span className="text-[10px] text-slate-500">
                            • {distribuidoraActiva.distanciaKm} km
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("seccion-catalogo");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Balones ({catalogo.length})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLimpiarDistribuidora}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Quitar distribuidora"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Distribuidoras (Modo Lista o selector rápido) */}
            {(vistaModo === "lista" || distribuidoresFiltrados.length <= 4) && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-0.5">
                  <span>Distribuidores por cercanía ({distribuidoresFiltrados.length}):</span>
                  <span>Clic para seleccionar</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {distribuidoresFiltrados.map((emp) => {
                    const seleccionada = empresaSeleccionada?.publicId === emp.publicId;
                    const sinCob = emp.distanciaKm > LIMITE_COBERTURA_KM;
                    return (
                      <button
                        key={emp.publicId}
                        type="button"
                        onClick={() => cambiarEmpresa(emp)}
                        className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                          seleccionada
                            ? "border-orange-500 bg-orange-50/70 shadow-2xs ring-1 ring-orange-400"
                            : sinCob
                            ? "border-slate-200 bg-slate-50/60 opacity-75 hover:opacity-100"
                            : "border-slate-200 hover:bg-slate-50 bg-white"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                            seleccionada
                              ? "bg-orange-600 text-white"
                              : sinCob
                              ? "bg-slate-200 text-slate-500"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Flame className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-[11px] text-slate-900 truncate">
                              {emp.nombreComercial}
                            </h4>
                            {sinCob ? (
                              <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1 rounded shrink-0">
                                Sin Cobertura
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded shrink-0">
                                {emp.distanciaKm} km
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            {sinCob ? (
                              <span className="text-red-600 font-semibold">
                                A {emp.distanciaKm} km (muy lejos)
                              </span>
                            ) : (
                              <>
                                <span>⏱️ {emp.tiempoMin}-{emp.tiempoMax} min</span>
                                <span className="text-amber-600 font-semibold">★ 4.9</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
            </div>
          )}
        </div>


                {/* Columna Derecha: Checkout y Resumen Ultra Compacto */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5 sticky top-14">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                Resumen del Pedido
              </h2>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                {Object.values(carrito).reduce((a, b) => a + b, 0)} balones
              </span>
            </div>

            {/* Distribuidora en Checkout: Con opción de limpiar y alerta de sin cobertura */}
            {empresaSeleccionada ? (
              <div
                className={`p-2 rounded-xl text-[11px] border transition ${
                  distribuidoraSinCobertura
                    ? "bg-red-50/70 border-red-300"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Distribuidora Despachadora:
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      {empresaSeleccionada.nombreComercial}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLimpiarDistribuidora}
                    className="text-[10px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded transition cursor-pointer shrink-0"
                    title="Quitar esta distribuidora"
                  >
                    ✕ Quitar
                  </button>
                </div>

                {distribuidoraActiva && (
                  <div className="mt-1">
                    {distribuidoraSinCobertura ? (
                      <div className="flex items-center gap-1 text-[10px] text-red-700 font-bold bg-red-100/70 px-1.5 py-0.5 rounded mt-0.5">
                        <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                        <span>Sin cobertura en tu zona (A {distribuidoraActiva.distanciaKm} km)</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        📍 {distribuidoraActiva.distanciaKm} km • ⏱️ {distribuidoraActiva.tiempoMin}-{distribuidoraActiva.tiempoMax} min (Express)
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px]">
                <span className="text-[9px] font-bold uppercase text-amber-700 block">
                  Distribuidora Despachadora:
                </span>
                <p className="font-bold text-amber-950 mt-0.5">⚠️ Ninguna seleccionada</p>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  Haz clic en una distribuidora en el mapa para ver sus balones y despachar tu pedido.
                </p>
              </div>
            )}

            {/* Items seleccionados en el carrito con imagen miniatura */}
            {Object.keys(carrito).length > 0 && (
              <div className="space-y-1.5 py-1.5 border-t border-slate-100 max-h-[140px] overflow-y-auto pr-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">
                  Balones en tu pedido:
                </span>
                {Object.entries(carrito).map(([prodId, cant]) => {
                  const prod = catalogo.find((p) => p.publicId === prodId);
                  if (!prod) return null;
                  const imgItem = obtenerImagenProducto(prod);
                  return (
                    <div
                      key={prodId}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50/80 border border-slate-100 text-[11px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-md bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                          <img
                            src={imgItem}
                            alt={prod.nombre}
                            className="h-7 w-auto object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/products/balon-10kg-premium.svg";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate text-[11px]">
                            {prod.nombre}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {cant} x S/ {prod.precio.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 text-[11px] shrink-0">
                        S/ {(prod.precio * cant).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dirección de Entrega Detallada (Calle, Distrito, Ciudad, Departamento) */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  Dirección de Entrega
                </span>
                <span className="text-[9px] text-slate-400 font-normal">Punto de destino</span>
              </label>

              {/* Calle / Avenida y Número */}
              <input
                type="text"
                value={direccionExacta}
                onChange={(e) => {
                  setDireccionExacta(e.target.value);
                  setDireccion(`${e.target.value}, ${distritoDireccion}`);
                }}
                placeholder="Calle / Avenida y N° (ej. Av. Antúnez de Mayolo 1234)..."
                className="w-full text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              />

              {/* Distrito, Ciudad y Departamento */}
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">
                    Distrito
                  </label>
                  <input
                    type="text"
                    value={distritoDireccion}
                    onChange={(e) => setDistritoDireccion(e.target.value)}
                    placeholder="Distrito..."
                    className="w-full text-[10px] font-semibold px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={ciudadDireccion}
                    onChange={(e) => setCiudadDireccion(e.target.value)}
                    placeholder="Ciudad..."
                    className="w-full text-[10px] font-semibold px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={departamentoDireccion}
                    onChange={(e) => setDepartamentoDireccion(e.target.value)}
                    placeholder="Departamento..."
                    className="w-full text-[10px] font-semibold px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Referencia */}
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Referencia (piso, dpto, reja negra, etc.)..."
                className="w-full text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Cupón Promocional Compacto */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-purple-600" />
                  Cupón
                </span>
                <span className="text-[9px] text-purple-600">Usa: GASPRIMERO</span>
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value)}
                  placeholder="Código..."
                  className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded-lg uppercase font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleValidarCupon}
                  disabled={validandoCupon}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {validandoCupon ? "..." : "Aplicar"}
                </button>
              </div>
              {errorCupon && <p className="text-[10px] text-red-600">{errorCupon}</p>}
              {cuponAplicado && (
                <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] text-emerald-800 flex items-center justify-between">
                  <span>{cuponAplicado.codigo} aplicado</span>
                  <span className="font-bold text-emerald-700">
                    - S/ {cuponAplicado.descuento.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Método de Pago en Cuadrícula Compacta */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-700 block">
                Método de Pago
              </label>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setMetodoPago("YAPE")}
                  className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-0.5 font-bold transition cursor-pointer ${
                    metodoPago === "YAPE"
                      ? "border-purple-500 bg-purple-50 text-purple-900 ring-1 ring-purple-400"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-600" />
                  Yape
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("EFECTIVO")}
                  className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-0.5 font-bold transition cursor-pointer ${
                    metodoPago === "EFECTIVO"
                      ? "border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-400"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-amber-600" />
                  Efectivo
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("PLIN")}
                  className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-0.5 font-bold transition cursor-pointer ${
                    metodoPago === "PLIN"
                      ? "border-cyan-500 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-400"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                  Plin
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("TARJETA")}
                  className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-0.5 font-bold transition cursor-pointer ${
                    metodoPago === "TARJETA"
                      ? "border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-400"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Tarjeta
                </button>
              </div>

              {metodoPago === "YAPE" && (
                <div className="p-1.5 bg-purple-50 border border-purple-200 rounded-lg text-[10px] flex items-center justify-between">
                  <span className="font-bold text-purple-900">Yape: 988-777-666</span>
                  <span className="text-purple-600 text-[9px]">Validación automática</span>
                </div>
              )}
            </div>

            {/* Totales Compactos */}
            <div className="space-y-1 pt-1.5 border-t border-slate-100 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Descuento:</span>
                  <span>- S/ {descuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Envío:</span>
                <span className="font-bold text-emerald-600 uppercase text-[9px]">Gratis</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                <span>Total:</span>
                <span className="text-orange-600">S/ {totalPagar.toFixed(2)}</span>
              </div>
            </div>

            {/* Alertas de error o de Sin Cobertura */}
            {distribuidoraSinCobertura && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-700 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Fuera de Cobertura:</strong> Esta distribuidora se encuentra a {distribuidoraActiva?.distanciaKm} km. El límite de reparto express es de {LIMITE_COBERTURA_KM} km. Por favor elige una más cercana en el mapa.
                </span>
              </div>
            )}

            {errorEnvio && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorEnvio}</span>
              </div>
            )}

            {/* Botones de Navegación del Flujo de Compra */}
            <div className="space-y-2 pt-1">
              <Link href="/cliente/carrito" className="block w-full">
                <button
                  type="button"
                  disabled={subtotal <= 0}
                  className={`w-full py-2.5 px-3 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 ${
                    subtotal <= 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>
                    Ver Carrito ({Object.values(carrito).reduce((a, b) => a + b, 0)}) • S/ {totalPagar.toFixed(2)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>

              <div className="grid grid-cols-2 gap-1.5">
                <Link href="/cliente/checkout" className="block w-full">
                  <button
                    type="button"
                    disabled={subtotal <= 0}
                    className={`w-full py-2 px-2 font-bold text-[11px] rounded-xl border transition flex items-center justify-center gap-1 ${
                      subtotal <= 0
                        ? "border-slate-200 text-slate-400 cursor-not-allowed"
                        : "border-orange-300 text-orange-700 hover:bg-orange-50 cursor-pointer"
                    }`}
                  >
                    <span>Ir a Checkout</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>

                <button
                  type="button"
                  onClick={handleConfirmarPedido}
                  disabled={
                    isPending ||
                    subtotal <= 0 ||
                    distribuidoraSinCobertura ||
                    !empresaSeleccionada
                  }
                  className={`w-full py-2 px-2 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1 ${
                    distribuidoraSinCobertura || !empresaSeleccionada || isPending || subtotal <= 0
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                  }`}
                >
                  <Flame className="w-3 h-3 text-amber-300" />
                  <span>{isPending ? "Pidiendo..." : "Pedir Exprés"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Flotante Inferior de Carrito (visible al navegar productos) */}
      {Object.keys(carrito).length > 0 && subtotal > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shrink-0 shadow-xs">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  {Object.values(carrito).reduce((a, b) => a + b, 0)} balones seleccionados
                </span>
                <span className="text-xs font-black text-orange-400 font-mono">
                  S/ {totalPagar.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Link href="/cliente/carrito">
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md px-3.5 h-8 gap-1.5 cursor-pointer"
                >
                  <span>Ver Carrito</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
