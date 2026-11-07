"use client";

import { ProductoDetalle } from "./api/catalogo.api";
import { EmpresaDetalle } from "./api/empresas.api";
import { ResultadoValidacionCupon } from "./api/fidelizacion.api";

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
  const actual = obtenerCarritoGas();
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
