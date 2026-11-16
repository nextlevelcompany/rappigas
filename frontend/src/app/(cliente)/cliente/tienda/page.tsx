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
  obtenerDireccionGas,
  obtenerMisDirecciones,
  guardarMisDirecciones,
  agregarDireccionCliente,
  actualizarDireccionCliente,
  eliminarDireccionCliente,
  establecerDireccionPredeterminada,
  DireccionClienteGuardada,
  obtenerMetodosPagoDistribuidor,
} from "@/librerias/carrito-gas";
import { toast } from "sonner";
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
  Bookmark,
  Home,
  Briefcase,
  Building,
  Star,
  Check,
  Edit3,
  X,
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

  // Mis Direcciones Guardadas
  const [misDirecciones, setMisDirecciones] = useState<DireccionClienteGuardada[]>([]);
  const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState<string | null>(null);
  const [modalMisDireccionesAbierto, setModalMisDireccionesAbierto] = useState(false);
  const [modalGuardarDireccionAbierto, setModalGuardarDireccionAbierto] = useState(false);
  const [direccionEnEdicion, setDireccionEnEdicion] = useState<DireccionClienteGuardada | null>(null);

  // Formulario para guardar/editar dirección
  const [formEtiqueta, setFormEtiqueta] = useState("Casa");
  const [formTipoIcono, setFormTipoIcono] = useState<"casa" | "trabajo" | "departamento" | "familiar" | "otro">("casa");
  const [formDireccionExacta, setFormDireccionExacta] = useState("");
  const [formDistrito, setFormDistrito] = useState("");
  const [formCiudad, setFormCiudad] = useState("");
  const [formDepartamento, setFormDepartamento] = useState("");
  const [formReferencia, setFormReferencia] = useState("");
  const [formEsPredeterminada, setFormEsPredeterminada] = useState(false);

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

  // Métodos de pago configurados específicamente por la distribuidora activa
  const metodosPagoDistribuidor = useMemo(() => {
    return obtenerMetodosPagoDistribuidor(empresaSeleccionada);
  }, [empresaSeleccionada]);

  // Si el método actual no está permitido por la distribuidora, auto-seleccionar el primero admitido
  useEffect(() => {
    if (metodosPagoDistribuidor.length > 0 && !metodosPagoDistribuidor.includes(metodoPago)) {
      setMetodoPago(metodosPagoDistribuidor[0]);
    }
  }, [metodosPagoDistribuidor, metodoPago]);

  // Escuchar si la distribuidora actualiza sus métodos de pago en tiempo real
  useEffect(() => {
    const handleSyncMetodos = () => {
      if (empresaSeleccionada) {
        const actualizados = obtenerMetodosPagoDistribuidor(empresaSeleccionada);
        if (actualizados.length > 0 && !actualizados.includes(metodoPago)) {
          setMetodoPago(actualizados[0]);
        }
      }
    };
    window.addEventListener("metodos_pago_distribuidor_actualizados", handleSyncMetodos);
    return () => window.removeEventListener("metodos_pago_distribuidor_actualizados", handleSyncMetodos);
  }, [empresaSeleccionada, metodoPago]);

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

  // Cargar mis direcciones guardadas y sincronizar
  useEffect(() => {
    const dirs = obtenerMisDirecciones(usuario?.publicId);
    setMisDirecciones(dirs);
    const predeterminada = dirs.find((d) => d.esPredeterminada) || dirs[0];
    if (predeterminada) {
      setDireccionSeleccionadaId(predeterminada.id);
      setDireccionExacta(predeterminada.direccionExacta);
      setDistritoDireccion(predeterminada.distrito);
      setCiudadDireccion(predeterminada.ciudad);
      setDepartamentoDireccion(predeterminada.departamento);
      setReferencia(predeterminada.referencia || "");
      setLatitud(predeterminada.latitud);
      setLongitud(predeterminada.longitud);
      setDireccion(
        `${predeterminada.direccionExacta}, ${predeterminada.distrito}, ${predeterminada.ciudad}`
      );
      if (predeterminada.telefono) {
        setTelefonoYape(predeterminada.telefono);
      }
    }

    const handleSyncMisDirecciones = (e: any) => {
      const actualizadas = e.detail || obtenerMisDirecciones(usuario?.publicId);
      setMisDirecciones(actualizadas);
    };

    window.addEventListener("mis_direcciones_actualizadas", handleSyncMisDirecciones);
    return () => {
      window.removeEventListener("mis_direcciones_actualizadas", handleSyncMisDirecciones);
    };
  }, [usuario?.publicId]);

  const renderIconoTipo = (tipo: string, className = "w-4 h-4") => {
    switch (tipo) {
      case "casa":
        return <Home className={className} />;
      case "trabajo":
        return <Briefcase className={className} />;
      case "departamento":
        return <Building className={className} />;
      case "familiar":
        return <Star className={className} />;
      default:
        return <Bookmark className={className} />;
    }
  };

  const handleSeleccionarDireccionGuardada = (dir: DireccionClienteGuardada) => {
    setDireccionSeleccionadaId(dir.id);
    setDireccionExacta(dir.direccionExacta);
    setDistritoDireccion(dir.distrito);
    setCiudadDireccion(dir.ciudad);
    setDepartamentoDireccion(dir.departamento);
    setReferencia(dir.referencia || "");
    setLatitud(dir.latitud);
    setLongitud(dir.longitud);
    setDireccion(`${dir.direccionExacta}, ${dir.distrito}, ${dir.ciudad}`);
    if (dir.telefono) {
      setTelefonoYape(dir.telefono);
    }
    toast.success(`Dirección fijada: "${dir.etiqueta}"`);
    setModalMisDireccionesAbierto(false);
  };

  const handleAbrirGuardarActual = () => {
    setDireccionEnEdicion(null);
    setFormEtiqueta(
      distritoDireccion ? `Casa ${distritoDireccion}` : "Mi Casa"
    );
    setFormTipoIcono("casa");
    setFormDireccionExacta(direccionExacta);
    setFormDistrito(distritoDireccion);
    setFormCiudad(ciudadDireccion || "Lima");
    setFormDepartamento(departamentoDireccion || "Lima");
    setFormReferencia(referencia);
    setFormEsPredeterminada(misDirecciones.length === 0);
    setModalGuardarDireccionAbierto(true);
  };

  const handleAbrirEditarDireccion = (dir: DireccionClienteGuardada) => {
    setDireccionEnEdicion(dir);
    setFormEtiqueta(dir.etiqueta);
    setFormTipoIcono(dir.tipoIcono);
    setFormDireccionExacta(dir.direccionExacta);
    setFormDistrito(dir.distrito);
    setFormCiudad(dir.ciudad);
    setFormDepartamento(dir.departamento);
    setFormReferencia(dir.referencia || "");
    setFormEsPredeterminada(dir.esPredeterminada);
    setModalGuardarDireccionAbierto(true);
  };

  const handleGuardarDireccionModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formEtiqueta.trim()) {
      toast.error("Ingresa un nombre o etiqueta (ej. Casa, Trabajo, Mamá)");
      return;
    }
    if (!formDireccionExacta.trim()) {
      toast.error("Ingresa la dirección exacta (calle, número o manzana/lote)");
      return;
    }
    if (!formDistrito.trim()) {
      toast.error("Ingresa el distrito");
      return;
    }

    if (direccionEnEdicion) {
      actualizarDireccionCliente(
        direccionEnEdicion.id,
        {
          etiqueta: formEtiqueta.trim(),
          tipoIcono: formTipoIcono,
          direccionExacta: formDireccionExacta.trim(),
          distrito: formDistrito.trim(),
          ciudad: formCiudad.trim() || "Lima",
          departamento: formDepartamento.trim() || "Lima",
          referencia: formReferencia.trim(),
          esPredeterminada: formEsPredeterminada,
          latitud: direccionEnEdicion.latitud || latitud,
          longitud: direccionEnEdicion.longitud || longitud,
          telefono: telefonoYape,
        },
        usuario?.publicId
      );
      toast.success(`Dirección "${formEtiqueta}" actualizada`);
    } else {
      const creada = agregarDireccionCliente(
        {
          etiqueta: formEtiqueta.trim(),
          tipoIcono: formTipoIcono,
          direccionExacta: formDireccionExacta.trim(),
          distrito: formDistrito.trim(),
          ciudad: formCiudad.trim() || "Lima",
          departamento: formDepartamento.trim() || "Lima",
          referencia: formReferencia.trim(),
          esPredeterminada: formEsPredeterminada,
          latitud: latitud,
          longitud: longitud,
          telefono: telefonoYape,
        },
        usuario?.publicId
      );
      setDireccionSeleccionadaId(creada.id);
      toast.success(`¡Dirección "${formEtiqueta}" guardada exitosamente!`);
    }

    const actualizadas = obtenerMisDirecciones(usuario?.publicId);
    setMisDirecciones(actualizadas);
    setModalGuardarDireccionAbierto(false);
    setDireccionEnEdicion(null);
  };

  const handleEliminarDireccion = (id: string, etiqueta: string) => {
    eliminarDireccionCliente(id, usuario?.publicId);
    const actualizadas = obtenerMisDirecciones(usuario?.publicId);
    setMisDirecciones(actualizadas);
    if (direccionSeleccionadaId === id) {
      if (actualizadas.length > 0) {
        handleSeleccionarDireccionGuardada(actualizadas[0]);
      } else {
        setDireccionSeleccionadaId(null);
      }
    }
    toast.success(`Dirección "${etiqueta}" eliminada`);
  };

  const handleEstablecerPredeterminada = (id: string, etiqueta: string) => {
    establecerDireccionPredeterminada(id, usuario?.publicId);
    const actualizadas = obtenerMisDirecciones(usuario?.publicId);
    setMisDirecciones(actualizadas);
    toast.success(`"${etiqueta}" fijada como predeterminada`);
  };

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
      {/* Barra Superior Unificada y Limpia */}
      <div className="bg-white rounded-2xl border border-slate-200/90 px-3.5 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 text-amber-200" />
            </div>
            <div className="leading-tight">
              <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                RappiGas
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                  Tienda
                </span>
              </h1>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Selector de Dirección Activa Clickable */}
          <button
            type="button"
            onClick={() => setModalMisDireccionesAbierto(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-300 text-left transition cursor-pointer group min-w-0 max-w-full sm:max-w-md"
            title="Haz clic para cambiar dirección de entrega"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none flex-wrap">
                <span className="text-[9px] font-extrabold uppercase text-slate-400">Entregar en:</span>
                <span className="text-[10px] font-black text-slate-800">
                  {misDirecciones.find((d) => d.id === direccionSeleccionadaId)?.etiqueta || "Dirección Activa"}
                </span>
                <span className="text-[10px] font-bold text-orange-700 bg-orange-100/90 px-1.5 py-0.2 rounded border border-orange-200">
                  {distritoDireccion || "Los Olivos"}, {ciudadDireccion || departamentoDireccion || "Lima"}
                </span>
                <span className="text-[9px] text-orange-600 font-bold ml-0.5 group-hover:underline">
                  [Cambiar]
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                {direccionExacta || direccion || "Av. Antúnez de Mayolo 1234"}
              </p>
            </div>
          </button>
        </div>

        {/* Acciones Rápidas y Puntos */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUsarGps}
            className="p-1.5 rounded-xl bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition cursor-pointer"
            title="Detectar ubicación GPS"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>

          <Link
            href="/cliente/direcciones"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition"
            title="Administrar Mis Direcciones"
          >
            <Bookmark className="w-3 h-3 text-slate-500" />
            <span>Direcciones</span>
          </Link>

          {/* Badge Puntos RappiGas */}
          <Link
            href="/cliente/puntos"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 text-amber-950 px-2.5 py-1 rounded-xl shadow-2xs border border-amber-300 font-black text-[11px] hover:scale-105 transition"
            title="Ver mis RappiPuntos"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-900 fill-amber-900 animate-pulse shrink-0" />
            <span className="font-mono">{billetera ? Number(billetera.saldoPuntos).toLocaleString() : "0"} PTS</span>
          </Link>
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


                {/* Columna Derecha: Checkout y Resumen con Color Distintivo */}
        <div className="space-y-3">
          <div className="bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-white rounded-2xl border-2 border-orange-300/80 shadow-md p-3.5 space-y-2.5 sticky top-[72px] max-h-[calc(100vh-85px)] overflow-y-auto">
            {/* Header Distintivo de Resumen con Color Propio */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 -mx-3.5 -mt-3.5 p-3 rounded-t-2xl text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-white text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                    Resumen del Pedido
                  </h2>
                  <p className="text-[10px] text-orange-100 leading-none mt-0.5">
                    Despacho Exprés RappiGas
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-950 bg-amber-300 px-2 py-0.5 rounded-lg shadow-xs font-mono">
                {Object.values(carrito).reduce((a, b) => a + b, 0)} balones
              </span>
            </div>

            {/* Distribuidora en Checkout Compacta */}
            {empresaSeleccionada ? (
              <div
                className={`p-2 rounded-xl text-[11px] border transition shadow-2xs ${
                  distribuidoraSinCobertura
                    ? "bg-red-50/70 border-red-300"
                    : "bg-white border-orange-200/90"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Planta:</span>
                    <span className="font-bold text-slate-900 truncate">
                      {empresaSeleccionada.nombreComercial}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLimpiarDistribuidora}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition cursor-pointer shrink-0"
                    title="Quitar esta distribuidora"
                  >
                    ✕
                  </button>
                </div>

                {distribuidoraActiva && (
                  <div className="mt-1">
                    {distribuidoraSinCobertura ? (
                      <div className="flex items-center gap-1 text-[10px] text-red-700 font-bold bg-red-100/70 px-1.5 py-0.5 rounded">
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
              <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase text-amber-700 block">
                    Distribuidora:
                  </span>
                  <p className="font-bold text-amber-950 truncate">⚠️ Selecciona una en el mapa</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVistaPrincipal("mapa")}
                  className="text-[10px] font-bold text-orange-600 hover:underline shrink-0"
                >
                  Ver Mapa
                </button>
              </div>
            )}

            {/* Items seleccionados en el carrito con imagen miniatura, control de cantidad y opción de eliminar */}
            {Object.keys(carrito).length > 0 && (
              <div className="space-y-1.5 py-1.5 border-t border-orange-200/70 max-h-[190px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-orange-900 uppercase">
                    Balones en tu pedido ({Object.values(carrito).reduce((a, b) => a + b, 0)}):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCarrito({});
                      vaciarCarritoGas();
                      setCuponAplicado(null);
                    }}
                    className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-bold transition cursor-pointer"
                    title="Vaciar todos los balones del pedido"
                  >
                    Vaciar todo
                  </button>
                </div>

                {Object.entries(carrito).map(([prodId, cant]) => {
                  const prod = catalogo.find((p) => p.publicId === prodId);
                  if (!prod) return null;
                  const imgItem = obtenerImagenProducto(prod);
                  return (
                    <div
                      key={prodId}
                      className="p-1.5 rounded-xl bg-white border border-orange-200/80 shadow-2xs space-y-1 text-[11px]"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-orange-50/50 border border-orange-200/60 p-0.5 flex items-center justify-center shrink-0">
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
                            <p className="font-bold text-slate-900 truncate text-[11px] leading-tight">
                              {prod.nombre}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              S/ {prod.precio.toFixed(2)} c/u
                            </p>
                          </div>
                        </div>

                        {/* Botón Eliminar Balón */}
                        <button
                          type="button"
                          onClick={() => modificarCantidad(prodId, -cant)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer shrink-0"
                          title="Eliminar este balón del pedido"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Fila de Cantidad (- / cant / +) y Subtotal */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-1.5 py-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => modificarCantidad(prodId, -1)}
                            className="w-4 h-4 rounded bg-white shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold cursor-pointer"
                            title="Disminuir cantidad"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-bold text-xs w-4 text-center text-slate-900 font-mono">
                            {cant}
                          </span>
                          <button
                            type="button"
                            onClick={() => modificarCantidad(prodId, 1)}
                            className="w-4 h-4 rounded bg-orange-600 text-white shadow-2xs flex items-center justify-center hover:bg-orange-700 font-bold cursor-pointer"
                            title="Aumentar cantidad"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <span className="font-bold text-slate-900 text-xs font-mono">
                          S/ {(prod.precio * cant).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Destino de Entrega Compacto */}
            <div className="space-y-1 pt-1 border-t border-orange-200/70">
              <div className="p-2 rounded-xl bg-white border border-orange-200/90 flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 truncate">
                      {misDirecciones.find((d) => d.id === direccionSeleccionadaId)?.etiqueta || "Entregar en"}:{" "}
                      <span className="font-medium text-slate-700">{direccionExacta || "Av. Antúnez de Mayolo 1234"}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      📍 {distritoDireccion || "Los Olivos"}, {ciudadDireccion || departamentoDireccion || "Lima"}
                      {referencia ? ` • Ref: ${referencia}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalMisDireccionesAbierto(true)}
                  className="px-2 py-0.5 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-bold shrink-0 transition cursor-pointer"
                >
                  Cambiar
                </button>
              </div>

              {/* Selector Rápido de 1-Clic de Direcciones */}
              {misDirecciones.length > 1 && (
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {misDirecciones.map((dir) => {
                    const esActiva = direccionSeleccionadaId === dir.id;
                    return (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() => handleSeleccionarDireccionGuardada(dir)}
                        className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                          esActiva
                            ? "bg-orange-500 text-white border-orange-600 shadow-2xs"
                            : "bg-white hover:bg-orange-50 text-slate-700 border-orange-200/80"
                        }`}
                        title={dir.direccionExacta}
                      >
                        {renderIconoTipo(dir.tipoIcono, "w-2.5 h-2.5")}
                        <span>{dir.etiqueta}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cupón Promocional Compacto */}
            <div className="space-y-1 pt-1 border-t border-orange-200/70">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-purple-600" />
                  Cupón
                </span>
                <span className="text-[9px] text-purple-600 font-bold">Usa: GASPRIMERO</span>
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value)}
                  placeholder="Código..."
                  className="flex-1 text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg uppercase font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-purple-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleValidarCupon}
                  disabled={validandoCupon}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {validandoCupon ? "..." : "Aplicar"}
                </button>
              </div>
              {errorCupon && <p className="text-[10px] text-red-600">{errorCupon}</p>}
              {cuponAplicado && (
                <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] text-emerald-800 flex items-center justify-between">
                  <span>{cuponAplicado.codigo} aplicado</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    - S/ {cuponAplicado.descuento.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Método de Pago Dinámico según Distribuidora */}
            <div className="space-y-1 pt-1 border-t border-orange-200/70">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">
                  Método de Pago
                </label>
                {empresaSeleccionada && (
                  <span className="text-[9px] font-bold text-orange-700 bg-orange-100/80 px-1.5 py-0.2 rounded border border-orange-200">
                    {metodosPagoDistribuidor.length} aceptado{metodosPagoDistribuidor.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {metodosPagoDistribuidor.length === 0 ? (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800">
                  Selecciona una distribuidora en el mapa para ver sus métodos de pago.
                </div>
              ) : (
                <div
                  className={`grid gap-1 text-[10px] ${
                    metodosPagoDistribuidor.length === 1
                      ? "grid-cols-1"
                      : metodosPagoDistribuidor.length === 2
                      ? "grid-cols-2"
                      : metodosPagoDistribuidor.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-4"
                  }`}
                >
                  {metodosPagoDistribuidor.includes("YAPE") && (
                    <button
                      type="button"
                      onClick={() => setMetodoPago("YAPE")}
                      className={`py-1 px-1 rounded-lg border flex items-center justify-center gap-1 font-bold transition cursor-pointer shadow-2xs ${
                        metodoPago === "YAPE"
                          ? "border-purple-500 bg-purple-50 text-purple-900 ring-1 ring-purple-400"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <QrCode className="w-3 h-3 text-purple-600" />
                      <span>Yape</span>
                    </button>
                  )}

                  {metodosPagoDistribuidor.includes("EFECTIVO") && (
                    <button
                      type="button"
                      onClick={() => setMetodoPago("EFECTIVO")}
                      className={`py-1 px-1 rounded-lg border flex items-center justify-center gap-1 font-bold transition cursor-pointer shadow-2xs ${
                        metodoPago === "EFECTIVO"
                          ? "border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-400"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <Banknote className="w-3 h-3 text-amber-600" />
                      <span>Efectivo</span>
                    </button>
                  )}

                  {metodosPagoDistribuidor.includes("PLIN") && (
                    <button
                      type="button"
                      onClick={() => setMetodoPago("PLIN")}
                      className={`py-1 px-1 rounded-lg border flex items-center justify-center gap-1 font-bold transition cursor-pointer shadow-2xs ${
                        metodoPago === "PLIN"
                          ? "border-cyan-500 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-400"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <Phone className="w-3 h-3 text-cyan-600" />
                      <span>Plin</span>
                    </button>
                  )}

                  {metodosPagoDistribuidor.includes("TARJETA") && (
                    <button
                      type="button"
                      onClick={() => setMetodoPago("TARJETA")}
                      className={`py-1 px-1 rounded-lg border flex items-center justify-center gap-1 font-bold transition cursor-pointer shadow-2xs ${
                        metodoPago === "TARJETA"
                          ? "border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-400"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <CreditCard className="w-3 h-3 text-blue-600" />
                      <span>Tarjeta POS</span>
                    </button>
                  )}
                </div>
              )}

              {metodoPago === "YAPE" && metodosPagoDistribuidor.includes("YAPE") && (
                <div className="p-1 bg-purple-50 border border-purple-200 rounded-lg text-[10px] flex items-center justify-between">
                  <span className="font-bold text-purple-900">
                    Yape {empresaSeleccionada?.nombreComercial ? `(${empresaSeleccionada.nombreComercial.split(" ")[0]})` : ""}: {empresaSeleccionada?.telefono || "988-777-666"}
                  </span>
                  <span className="text-purple-600 text-[9px]">Validación directa</span>
                </div>
              )}

              {metodoPago === "PLIN" && metodosPagoDistribuidor.includes("PLIN") && (
                <div className="p-1 bg-cyan-50 border border-cyan-200 rounded-lg text-[10px] flex items-center justify-between">
                  <span className="font-bold text-cyan-900">
                    Plin: {empresaSeleccionada?.telefono || "988-777-666"}
                  </span>
                  <span className="text-cyan-600 text-[9px]">Pago móvil</span>
                </div>
              )}

              {metodoPago === "TARJETA" && metodosPagoDistribuidor.includes("TARJETA") && (
                <div className="p-1 bg-blue-50 border border-blue-200 rounded-lg text-[10px] flex items-center justify-between">
                  <span className="font-bold text-blue-900">El chofer llevará POS para cobro</span>
                  <span className="text-blue-600 text-[9px]">Visa/Master</span>
                </div>
              )}

              {metodoPago === "EFECTIVO" && metodosPagoDistribuidor.includes("EFECTIVO") && (
                <div className="p-1 bg-amber-50 border border-amber-200 rounded-lg text-[10px] flex items-center justify-between">
                  <span className="font-bold text-amber-900">Efectivo contra entrega en puerta</span>
                  <span className="text-amber-700 text-[9px]">Con sencillo/cambio</span>
                </div>
              )}
            </div>

            {/* Totales Compactos Destacados */}
            <div className="space-y-1 pt-1.5 border-t border-orange-200/80 text-[11px] bg-white/95 p-2.5 rounded-xl border border-orange-200/90 shadow-2xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">S/ {subtotal.toFixed(2)}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Descuento:</span>
                  <span>- S/ {descuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Envío:</span>
                <span className="font-bold text-emerald-700 uppercase text-[9px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Gratis</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 pt-1.5 border-t border-orange-200/60 items-baseline">
                <span>Total a Pagar:</span>
                <span className="text-orange-600 font-black text-base font-mono">S/ {totalPagar.toFixed(2)}</span>
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

            {/* Acción Principal Hero + Enlaces Secundarios */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmarPedido}
                disabled={
                  isPending ||
                  subtotal <= 0 ||
                  distribuidoraSinCobertura ||
                  !empresaSeleccionada
                }
                className={`w-full py-2.5 px-3 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 ${
                  distribuidoraSinCobertura || !empresaSeleccionada || isPending || subtotal <= 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                }`}
              >
                <Flame className="w-4 h-4 text-amber-200" />
                <span>
                  {isPending
                    ? "Procesando pedido..."
                    : subtotal <= 0
                    ? "Agrega balones al pedido"
                    : `Pedir Exprés Ahora • S/ ${totalPagar.toFixed(2)}`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 pt-0.5">
                <Link
                  href="/cliente/carrito"
                  className="font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3" />
                  Ver Carrito Completo
                </Link>
                <span>•</span>
                <Link
                  href="/cliente/checkout"
                  className="font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1"
                >
                  Checkout Detallado
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Flotante Inferior de Carrito (visible solo en móviles/tablets para no tapar el catálogo en escritorio) */}
      {Object.keys(carrito).length > 0 && subtotal > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-5">
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
      {/* MODAL 1: Mis Direcciones Guardadas */}
      {modalMisDireccionesAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 via-amber-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Mis Direcciones Guardadas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecciona tu dirección de entrega o administra tus lugares habituales
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalMisDireccionesAbierto(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Lista de Direcciones */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {/* Botón rápido para agregar nueva dirección */}
              <button
                type="button"
                onClick={handleAbrirGuardarActual}
                className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/60 hover:bg-orange-50 text-orange-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-orange-600" />
                <span>+ Agregar Nueva Dirección</span>
              </button>

              {misDirecciones.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">No tienes direcciones guardadas</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Guarda tus direcciones frecuentes como tu casa u oficina para pedir balones con 1 solo clic.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {misDirecciones.map((dir) => {
                    const esSeleccionada = direccionSeleccionadaId === dir.id;
                    return (
                      <div
                        key={dir.id}
                        className={`p-3.5 rounded-2xl border transition ${
                          esSeleccionada
                            ? "bg-orange-50/50 border-orange-400 ring-2 ring-orange-200"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              esSeleccionada ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"
                            }`}>
                              {renderIconoTipo(dir.tipoIcono, "w-4 h-4")}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-xs text-slate-900">
                                  {dir.etiqueta}
                                </span>
                                {dir.esPredeterminada && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-200">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                    Predeterminada
                                  </span>
                                )}
                                {esSeleccionada && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-200">
                                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                                    En uso
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-slate-700 mt-0.5 break-words">
                                {dir.direccionExacta}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {dir.distrito}, {dir.ciudad}, {dir.departamento}
                              </p>
                              {dir.referencia && (
                                <p className="text-[10px] italic text-slate-400 mt-0.5">
                                  Ref: {dir.referencia}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Acciones de Edición/Eliminar */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAbrirEditarDireccion(dir)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Editar dirección"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarDireccion(dir.id, dir.etiqueta)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Eliminar dirección"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Barra de Selección y Favorito */}
                        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100 text-xs">
                          <div>
                            {!dir.esPredeterminada && (
                              <button
                                type="button"
                                onClick={() => handleEstablecerPredeterminada(dir.id, dir.etiqueta)}
                                className="text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Star className="w-3 h-3 text-amber-500" />
                                <span>Hacer Predeterminada</span>
                              </button>
                            )}
                          </div>
                          <div>
                            {esSeleccionada ? (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Dirección activa para el pedido</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSeleccionarDireccionGuardada(dir)}
                                className="px-3 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                              >
                                Usar esta dirección
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

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                {misDirecciones.length} dirección{misDirecciones.length === 1 ? "" : "es"} guardada{misDirecciones.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => setModalMisDireccionesAbierto(false)}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Guardar o Editar Dirección */}
      {modalGuardarDireccionAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 via-amber-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {direccionEnEdicion ? "Editar Dirección Guardada" : "Guardar Dirección"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Guarda tus datos para pedir balones sin rellenar la dirección cada vez
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalGuardarDireccionAbierto(false);
                  setDireccionEnEdicion(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGuardarDireccionModal} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
              {/* Selector de Tipo de Lugar */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 block">Tipo de lugar:</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(
                    [
                      { tipo: "casa", label: "Casa", icon: Home },
                      { tipo: "trabajo", label: "Trabajo", icon: Briefcase },
                      { tipo: "departamento", label: "Depto", icon: Building },
                      { tipo: "familiar", label: "Familiar", icon: Star },
                      { tipo: "otro", label: "Otro", icon: Bookmark },
                    ] as const
                  ).map((item) => {
                    const IconComp = item.icon;
                    const activo = formTipoIcono === item.tipo;
                    return (
                      <button
                        key={item.tipo}
                        type="button"
                        onClick={() => {
                          setFormTipoIcono(item.tipo);
                          if (!direccionEnEdicion && (!formEtiqueta || formEtiqueta === "Casa" || formEtiqueta === "Trabajo")) {
                            setFormEtiqueta(item.label);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                          activo
                            ? "bg-orange-50 border-orange-500 text-orange-700 shadow-2xs"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <IconComp className="w-4 h-4 mb-0.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nombre / Etiqueta */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block">
                  Nombre de la dirección:
                </label>
                <input
                  type="text"
                  value={formEtiqueta}
                  onChange={(e) => setFormEtiqueta(e.target.value)}
                  placeholder="Ej: Casa Principal, Oficina Los Olivos, Departamento 302..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Dirección Exacta */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block">
                  Calle, Avenida o Jirón y N°:
                </label>
                <input
                  type="text"
                  value={formDireccionExacta}
                  onChange={(e) => setFormDireccionExacta(e.target.value)}
                  placeholder="Ej: Av. Antúnez de Mayolo 1234..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Distrito, Ciudad y Departamento */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-[10px] uppercase text-slate-400 block">Distrito:</label>
                  <input
                    type="text"
                    value={formDistrito}
                    onChange={(e) => setFormDistrito(e.target.value)}
                    placeholder="Distrito..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[10px] uppercase text-slate-400 block">Ciudad:</label>
                  <input
                    type="text"
                    value={formCiudad}
                    onChange={(e) => setFormCiudad(e.target.value)}
                    placeholder="Ciudad..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[10px] uppercase text-slate-400 block">Dpto:</label>
                  <input
                    type="text"
                    value={formDepartamento}
                    onChange={(e) => setFormDepartamento(e.target.value)}
                    placeholder="Departamento..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Referencia */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block">
                  Referencia de entrega:
                </label>
                <input
                  type="text"
                  value={formReferencia}
                  onChange={(e) => setFormReferencia(e.target.value)}
                  placeholder="Ej: A 2 cuadras del parque, portón verde, piso 2..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Checkbox Predeterminada */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formEsPredeterminada}
                  onChange={(e) => setFormEsPredeterminada(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded border-amber-300 focus:ring-orange-500"
                />
                <span className="font-bold text-xs text-amber-950">
                  Establecer como mi dirección predeterminada
                </span>
              </label>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalGuardarDireccionAbierto(false);
                    setDireccionEnEdicion(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
                >
                  {direccionEnEdicion ? "Actualizar Dirección" : "Guardar Dirección"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
