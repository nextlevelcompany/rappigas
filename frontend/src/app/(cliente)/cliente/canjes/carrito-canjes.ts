"use client";

import { PremioCanje } from "./premios-data";

export interface ItemCarritoCanje {
  premio: PremioCanje;
  cantidad: number;
}

export interface CanjePedidoCliente {
  id: string;
  codigoCupon: string;
  fecha: string;
  cliente: {
    nombre: string;
    documento: string;
    telefono: string;
    distrito: string;
    direccion: string;
    email?: string;
  };
  premio: {
    id: string;
    nombre: string;
    categoria: string;
    marca: string;
    imagen: string;
    puntos: number;
    valorSoles: number;
  };
  estado: "PENDIENTE" | "EN_CURSO" | "ENTREGADO" | "CANCELADO";
  distribuidorAsignado: string;
  repartidor: string;
  fechaEntregaEstimada: string;
  fechaEntregaReal?: string;
  observaciones?: string;
}

export const STORAGE_KEY_CARRITO_CANJES = "rappigas_carrito_canjes";
export const STORAGE_KEY_CANJES_PEDIDOS = "rappigas_canjes_pedidos";
export const STORAGE_KEY_SALDO_PUNTOS = "rappigas_saldo_puntos_override";

export function obtenerCarritoCanjes(): ItemCarritoCanje[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARRITO_CANJES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error("Error al leer carrito de canjes:", err);
  }
  return [];
}

export function guardarCarritoCanjes(items: ItemCarritoCanje[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CARRITO_CANJES, JSON.stringify(items));
    window.dispatchEvent(new Event("carrito_canjes_actualizado"));
  } catch (err) {
    console.error("Error al guardar carrito de canjes:", err);
  }
}

export function agregarAlCarritoCanjes(premio: PremioCanje, cantidad: number = 1): ItemCarritoCanje[] {
  const actual = obtenerCarritoCanjes();
  const existenteIndex = actual.findIndex((item) => item.premio.id === premio.id);

  let nuevoCarrito: ItemCarritoCanje[];
  if (existenteIndex >= 0) {
    nuevoCarrito = actual.map((item, index) => {
      if (index === existenteIndex) {
        return { ...item, cantidad: item.cantidad + cantidad };
      }
      return item;
    });
  } else {
    nuevoCarrito = [...actual, { premio, cantidad }];
  }

  guardarCarritoCanjes(nuevoCarrito);
  return nuevoCarrito;
}

export function actualizarCantidadCarritoCanjes(premioId: string, cantidad: number): ItemCarritoCanje[] {
  const actual = obtenerCarritoCanjes();
  let nuevoCarrito: ItemCarritoCanje[];

  if (cantidad <= 0) {
    nuevoCarrito = actual.filter((item) => item.premio.id !== premioId);
  } else {
    nuevoCarrito = actual.map((item) => {
      if (item.premio.id === premioId) {
        return { ...item, cantidad };
      }
      return item;
    });
  }

  guardarCarritoCanjes(nuevoCarrito);
  return nuevoCarrito;
}

export function eliminarDelCarritoCanjes(premioId: string): ItemCarritoCanje[] {
  const actual = obtenerCarritoCanjes();
  const nuevoCarrito = actual.filter((item) => item.premio.id !== premioId);
  guardarCarritoCanjes(nuevoCarrito);
  return nuevoCarrito;
}

export function vaciarCarritoCanjes() {
  guardarCarritoCanjes([]);
}

// Historial de Canjes de Fidelidad
export function obtenerHistorialCanjes(): CanjePedidoCliente[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CANJES_PEDIDOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error("Error al leer historial de canjes:", err);
  }
  return [];
}

export function registrarNuevosCanjes(nuevos: CanjePedidoCliente[]) {
  if (typeof window === "undefined") return;
  try {
    const actuales = obtenerHistorialCanjes();
    const actualizados = [...nuevos, ...actuales];
    localStorage.setItem(STORAGE_KEY_CANJES_PEDIDOS, JSON.stringify(actualizados));
    window.dispatchEvent(new Event("nuevo_canje_registrado"));
  } catch (err) {
    console.error("Error al registrar nuevos canjes:", err);
  }
}

// Control local de saldo de puntos
export function obtenerSaldoPuntosOverride(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SALDO_PUNTOS);
    if (raw !== null) {
      const val = parseInt(raw, 10);
      if (!isNaN(val)) return val;
    }
  } catch {
    return null;
  }
  return null;
}

export function guardarSaldoPuntosOverride(nuevoSaldo: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SALDO_PUNTOS, String(nuevoSaldo));
    window.dispatchEvent(new Event("puntos_actualizados"));
  } catch (err) {
    console.error("Error al guardar saldo de puntos:", err);
  }
}
