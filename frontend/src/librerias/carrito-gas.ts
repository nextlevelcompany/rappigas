"use client";

import { ProductoDetalle } from "./api/catalogo.api";
import { EmpresaDetalle } from "./api/empresas.api";
import { ResultadoValidacionCupon } from "./api/fidelizacion.api";
import { MetodoPago } from "./api/finanzas.api";

export interface ItemCarritoGas {
  producto: ProductoDetalle;
  cantidad: number;
  empresaPublicId?: string;
  empresaId?: string;
  empresaNombre?: string;
}

export const STORAGE_KEY_CARRITO_GAS = "rappigas_carrito_gas";
export const STORAGE_KEY_EMPRESA_SELECCIONADA = "rappigas_empresa_seleccionada";
export const STORAGE_KEY_CUPON_GAS = "rappigas_cupon_gas";
export const STORAGE_KEY_DIRECCION_GAS = "rappigas_direccion_gas";

export function obtenerCarritoGas(): ItemCarritoGas[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARRITO_GAS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error("Error al leer carrito de gas:", err);
  }
  return [];
}

export function guardarCarritoGas(items: ItemCarritoGas[]) {
  if (typeof window === "undefined") return;
  try {
    const str = JSON.stringify(items);
    if (localStorage.getItem(STORAGE_KEY_CARRITO_GAS) === str) {
      return;
    }
    localStorage.setItem(STORAGE_KEY_CARRITO_GAS, str);
    window.dispatchEvent(new Event("carrito_gas_actualizado"));
  } catch (err) {
    console.error("Error al guardar carrito de gas:", err);
  }
}

export function obtenerEmpresaSeleccionada(): EmpresaDetalle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMPRESA_SELECCIONADA);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function guardarEmpresaSeleccionada(empresa: EmpresaDetalle | null) {
  if (typeof window === "undefined") return;
  try {
    if (!empresa) {
      localStorage.removeItem(STORAGE_KEY_EMPRESA_SELECCIONADA);
    } else {
      localStorage.setItem(STORAGE_KEY_EMPRESA_SELECCIONADA, JSON.stringify(empresa));
    }
  } catch (err) {
    console.error("Error al guardar empresa seleccionada:", err);
  }
}

export function obtenerCuponGas(): ResultadoValidacionCupon | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUPON_GAS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function guardarCuponGas(cupon: ResultadoValidacionCupon | null) {
  if (typeof window === "undefined") return;
  try {
    if (!cupon) {
      localStorage.removeItem(STORAGE_KEY_CUPON_GAS);
    } else {
      localStorage.setItem(STORAGE_KEY_CUPON_GAS, JSON.stringify(cupon));
    }
  } catch (err) {
    console.error("Error al guardar cupón de gas:", err);
  }
}

export interface DireccionGasGuardada {
  direccionExacta: string;
  distrito: string;
  ciudad: string;
  departamento: string;
  referencia: string;
  latitud: number;
  longitud: number;
  telefono: string;
  notas: string;
}

export function obtenerDireccionGas(): DireccionGasGuardada | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DIRECCION_GAS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function guardarDireccionGas(dir: DireccionGasGuardada | null) {
  if (typeof window === "undefined") return;
  try {
    if (!dir) {
      localStorage.removeItem(STORAGE_KEY_DIRECCION_GAS);
    } else {
      localStorage.setItem(STORAGE_KEY_DIRECCION_GAS, JSON.stringify(dir));
    }
  } catch (err) {
    console.error("Error al guardar dirección de gas:", err);
  }
}

// =========================================================================
// MIS DIRECCIONES GUARDADAS (CLIENTE FRECUENTE)
// =========================================================================
export const STORAGE_KEY_MIS_DIRECCIONES = "rappigas_mis_direcciones";

export interface DireccionClienteGuardada {
  id: string;
  etiqueta: string;
  tipoIcono: "casa" | "trabajo" | "departamento" | "familiar" | "otro";
  direccionExacta: string;
  distrito: string;
  ciudad: string;
  departamento: string;
  referencia: string;
  latitud: number;
  longitud: number;
  telefono?: string;
  esPredeterminada: boolean;
  creadoEn: string;
}

const DIRECCIONES_PREDETERMINADAS_DEFAULT: DireccionClienteGuardada[] = [
  {
    id: "dir-casa",
    etiqueta: "Casa",
    tipoIcono: "casa",
    direccionExacta: "Av. Antúnez de Mayolo 1234",
    distrito: "Los Olivos",
    ciudad: "Lima",
    departamento: "Lima",
    referencia: "A 2 cuadras de la municipalidad, reja blanca",
    latitud: -11.9912,
    longitud: -77.0711,
    telefono: "977665554",
    esPredeterminada: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "dir-trabajo",
    etiqueta: "Trabajo / Oficina",
    tipoIcono: "trabajo",
    direccionExacta: "Av. Javier Prado Este 4200",
    distrito: "Santiago de Surco",
    ciudad: "Lima",
    departamento: "Lima",
    referencia: "Edificio empresarial piso 4",
    latitud: -12.0863,
    longitud: -76.9744,
    telefono: "987654321",
    esPredeterminada: false,
    creadoEn: "2026-01-02T00:00:00.000Z",
  },
];

export function obtenerMisDirecciones(userId?: string): DireccionClienteGuardada[] {
  if (typeof window === "undefined") return DIRECCIONES_PREDETERMINADAS_DEFAULT;
  try {
    const key = userId ? `${STORAGE_KEY_MIS_DIRECCIONES}_${userId}` : STORAGE_KEY_MIS_DIRECCIONES;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(DIRECCIONES_PREDETERMINADAS_DEFAULT));
      return DIRECCIONES_PREDETERMINADAS_DEFAULT;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DIRECCIONES_PREDETERMINADAS_DEFAULT;
  } catch {
    return DIRECCIONES_PREDETERMINADAS_DEFAULT;
  }
}

export function guardarMisDirecciones(direcciones: DireccionClienteGuardada[], userId?: string) {
  if (typeof window === "undefined") return;
  try {
    const key = userId ? `${STORAGE_KEY_MIS_DIRECCIONES}_${userId}` : STORAGE_KEY_MIS_DIRECCIONES;
    localStorage.setItem(key, JSON.stringify(direcciones));
    window.dispatchEvent(new CustomEvent("mis_direcciones_actualizadas", { detail: direcciones }));
  } catch (err) {
    console.error("Error al guardar mis direcciones:", err);
  }
}

export function agregarDireccionCliente(
  nueva: Omit<DireccionClienteGuardada, "id" | "creadoEn">,
  userId?: string
): DireccionClienteGuardada {
  const lista = obtenerMisDirecciones(userId);
  const id = `dir-${Date.now().toString(36)}`;
  const listaAjustada = nueva.esPredeterminada
    ? lista.map((d) => ({ ...d, esPredeterminada: false }))
    : lista;

  const creada: DireccionClienteGuardada = {
    ...nueva,
    id,
    creadoEn: new Date().toISOString(),
  };

  const resultado = [creada, ...listaAjustada];
  guardarMisDirecciones(resultado, userId);
  return creada;
}

export function actualizarDireccionCliente(
  id: string,
  cambios: Partial<DireccionClienteGuardada>,
  userId?: string
): boolean {
  const lista = obtenerMisDirecciones(userId);
  let encontrada = false;
  const resultado = lista.map((d) => {
    if (d.id === id) {
      encontrada = true;
      return { ...d, ...cambios };
    }
    if (cambios.esPredeterminada) {
      return { ...d, esPredeterminada: false };
    }
    return d;
  });

  if (encontrada) {
    guardarMisDirecciones(resultado, userId);
    return true;
  }
  return false;
}

export function eliminarDireccionCliente(id: string, userId?: string): boolean {
  const lista = obtenerMisDirecciones(userId);
  const resultado = lista.filter((d) => d.id !== id);
  if (resultado.length !== lista.length) {
    if (resultado.length > 0 && !resultado.some((d) => d.esPredeterminada)) {
      resultado[0].esPredeterminada = true;
    }
    guardarMisDirecciones(resultado, userId);
    return true;
  }
  return false;
}

export function establecerDireccionPredeterminada(id: string, userId?: string): boolean {
  const lista = obtenerMisDirecciones(userId);
  const resultado = lista.map((d) => ({
    ...d,
    esPredeterminada: d.id === id,
  }));
  guardarMisDirecciones(resultado, userId);
  return true;
}

export function sincronizarCarritoGasDesdeTienda(
  carritoMap: { [productoId: string]: number },
  catalogo: ProductoDetalle[],
  empresa?: EmpresaDetalle | null
) {
  if (empresa) {
    guardarEmpresaSeleccionada(empresa);
  }
  const items: ItemCarritoGas[] = [];
  for (const [prodId, cant] of Object.entries(carritoMap)) {
    if (cant <= 0) continue;
    const prod = catalogo.find((p) => p.publicId === prodId);
    if (prod) {
      items.push({
        producto: prod,
        cantidad: cant,
        empresaPublicId: empresa ? empresa.publicId : undefined,
        empresaId: empresa ? String(empresa.id) : undefined,
        empresaNombre: empresa ? empresa.nombreComercial || empresa.razonSocial : undefined,
      });
    }
  }
  guardarCarritoGas(items);
}

export function agregarAlCarritoGas(
  producto: ProductoDetalle,
  cantidad: number = 1,
  empresa?: EmpresaDetalle | null
): ItemCarritoGas[] {
  if (empresa) {
    guardarEmpresaSeleccionada(empresa);
  }
  let actual = obtenerCarritoGas();
  // Garantizar que el pedido salga de una única distribuidora: si el carrito tiene productos
  // de otra distribuidora previa, se reinicia para evitar incompatibilidad en el despacho
  if (empresa && actual.some((item) => item.empresaPublicId && item.empresaPublicId !== empresa.publicId)) {
    actual = [];
  }
  const index = actual.findIndex((item) => item.producto.publicId === producto.publicId);
  let nuevo: ItemCarritoGas[];

  if (index >= 0) {
    nuevo = actual.map((item, idx) => {
      if (idx === index) {
        return { ...item, cantidad: item.cantidad + cantidad };
      }
      return item;
    });
  } else {
    nuevo = [
      ...actual,
      {
        producto,
        cantidad,
        empresaPublicId: empresa ? empresa.publicId : undefined,
        empresaId: empresa ? String(empresa.id) : undefined,
        empresaNombre: empresa ? empresa.nombreComercial || empresa.razonSocial : undefined,
      },
    ];
  }
  guardarCarritoGas(nuevo);
  return nuevo;
}

export function actualizarCantidadCarritoGas(
  productoPublicId: string,
  delta: number
): ItemCarritoGas[] {
  const actual = obtenerCarritoGas();
  const nuevo = actual
    .map((item) => {
      if (item.producto.publicId === productoPublicId) {
        const nuevaCant = item.cantidad + delta;
        return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
      }
      return item;
    })
    .filter(Boolean) as ItemCarritoGas[];
  guardarCarritoGas(nuevo);
  return nuevo;
}

export function establecerCantidadCarritoGas(
  productoPublicId: string,
  cantidad: number
): ItemCarritoGas[] {
  const actual = obtenerCarritoGas();
  let nuevo: ItemCarritoGas[];
  if (cantidad <= 0) {
    nuevo = actual.filter((item) => item.producto.publicId !== productoPublicId);
  } else {
    nuevo = actual.map((item) => {
      if (item.producto.publicId === productoPublicId) {
        return { ...item, cantidad };
      }
      return item;
    });
  }
  guardarCarritoGas(nuevo);
  return nuevo;
}

export function eliminarDelCarritoGas(productoPublicId: string): ItemCarritoGas[] {
  const actual = obtenerCarritoGas();
  const nuevo = actual.filter((item) => item.producto.publicId !== productoPublicId);
  guardarCarritoGas(nuevo);
  return nuevo;
}

export function vaciarCarritoGas() {
  guardarCarritoGas([]);
  guardarCuponGas(null);
}

export function obtenerImagenProductoGas(prod: {
  imagenUrl?: string;
  tipoGas?: string;
  tipoValvula?: string;
}): string {
  if (prod.imagenUrl && prod.imagenUrl.trim() !== "") {
    let url = prod.imagenUrl.trim();
    if (url.startsWith("/api/v1/archivos/ver/")) {
      return `http://localhost:8080${url}`;
    }
    // Si la URL apunta a un SVG anterior de balón, priorizar la foto PNG de alta calidad
    if (url.endsWith(".svg") && url.includes("/products/balon-")) {
      url = url.replace(".svg", ".png");
    }
    return url;
  }
  if (prod.tipoGas === "GLP_10KG") {
    return prod.tipoValvula === "ROSCA"
      ? "/products/balon-10kg-rosca.png"
      : "/products/balon-10kg-premium.png";
  }
  if (prod.tipoGas === "GLP_15KG") {
    return "/products/balon-15kg-premium.png";
  }
  if (prod.tipoGas === "GLP_45KG") {
    return "/products/balon-45kg-industrial.png";
  }
  if (prod.tipoGas === "VALVULA_ACCESORIO") {
    return "/products/regulador-manometro.svg";
  }
  return "/products/balon-10kg-premium.png";
}

// =========================================================================
// MÉTODOS DE PAGO CONFIGURADOS POR DISTRIBUIDOR
// =========================================================================
export const STORAGE_KEY_METODOS_PAGO_EMPRESAS = "rappigas_metodos_pago_empresas";

// Configuración predeterminada según la distribuidora
const METODOS_DEFAULT_POR_DISTRIBUIDOR: Record<string, MetodoPago[]> = {
  solgas: ["EFECTIVO", "YAPE", "PLIN", "TARJETA"],
  llamagas: ["EFECTIVO", "YAPE"],
  "zeta gas": ["EFECTIVO", "YAPE", "TARJETA"],
  primax: ["EFECTIVO", "YAPE", "PLIN"],
  limagas: ["EFECTIVO", "YAPE", "PLIN", "TARJETA"],
};

export function obtenerMetodosPagoDistribuidor(
  empresa: { publicId?: string; nombreComercial?: string; ruc?: string; telefono?: string } | null | undefined
): MetodoPago[] {
  if (!empresa) return ["EFECTIVO", "YAPE"];

  if (typeof window !== "undefined") {
    try {
      const idClave = empresa.publicId || empresa.ruc || empresa.nombreComercial;
      if (idClave) {
        const raw = localStorage.getItem(`${STORAGE_KEY_METODOS_PAGO_EMPRESAS}_${idClave}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
          if (parsed?.metodos && Array.isArray(parsed.metodos) && parsed.metodos.length > 0) {
            return parsed.metodos;
          }
        }
      }
    } catch {
      // Ignorar error al leer localStorage
    }
  }

  // Si no hay configuración manual en localStorage, inferir según la marca/nombre del distribuidor
  const nombreLower = (empresa.nombreComercial || "").toLowerCase();
  for (const [clave, metodos] of Object.entries(METODOS_DEFAULT_POR_DISTRIBUIDOR)) {
    if (nombreLower.includes(clave)) {
      return metodos;
    }
  }

  // Por defecto cualquier distribuidor acepta Efectivo y Yape
  return ["EFECTIVO", "YAPE"];
}

export function guardarMetodosPagoDistribuidor(
  empresaId: string,
  metodos: MetodoPago[]
) {
  if (typeof window === "undefined" || !empresaId) return;
  try {
    localStorage.setItem(
      `${STORAGE_KEY_METODOS_PAGO_EMPRESAS}_${empresaId}`,
      JSON.stringify(metodos)
    );
    window.dispatchEvent(
      new CustomEvent("metodos_pago_distribuidor_actualizados", {
        detail: { empresaId, metodos },
      })
    );
  } catch (err) {
    console.error("Error al guardar métodos de pago del distribuidor:", err);
  }
}
