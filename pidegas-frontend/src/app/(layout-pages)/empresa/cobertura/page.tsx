"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  coberturaApi,
  ZonaCoberturaDetalle,
  RespuestaVerificarCobertura,
} from "@/librerias/api/cobertura.api";
import { ubigeoApi } from "@/librerias/api/ubigeo.api";
import {
  CheckCircle,
  XCircle,
  BuildingHouse,
  RefreshCw,
  Search,
} from "@boxicons/react";
import { MapPin, Navigation, Compass, Layers, Plus, Trash2 } from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

// Presets geográficos de Lima para prueba y configuración rápida
const PRESETS_LIMA: { nombre: string; coordenadas: [number, number][] }[] = [
  {
    nombre: "Lima Norte (Los Olivos, SMP, Independencia)",
    coordenadas: [
      [-77.085, -11.975],
      [-77.05, -11.975],
      [-77.05, -12.02],
      [-77.085, -12.02],
      [-77.085, -11.975],
    ],
  },
  {
    nombre: "Lima Centro (Cercado, Breña, Jesús María)",
    coordenadas: [
      [-77.065, -12.035],
      [-77.025, -12.035],
      [-77.025, -12.075],
      [-77.065, -12.075],
      [-77.065, -12.035],
    ],
  },
  {
    nombre: "Lima Sur (Miraflores, San Isidro, Surco)",
    coordenadas: [
      [-77.045, -12.085],
      [-76.995, -12.085],
      [-76.995, -12.145],
      [-77.045, -12.145],
      [-77.045, -12.085],
    ],
  },
];

export default function CoberturaPage() {
  const [zonas, setZonas] = useState<ZonaCoberturaDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal para nueva zona
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [coordenadasTexto, setCoordenadasTexto] = useState(
    JSON.stringify(PRESETS_LIMA[0].coordenadas, null, 2)
  );

  // Verificador de Cobertura ST_Covers
  const [testLat, setTestLat] = useState("-11.9950");
  const [testLng, setTestLng] = useState("-77.0650");
  const [resultadoTest, setResultadoTest] = useState<RespuestaVerificarCobertura | null>(null);
  const [probandoCobertura, setProbandoCobertura] = useState(false);

  const cargarZonas = async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const res = await coberturaApi.listarMisZonas();
      setZonas(res);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("permisos")) {
        setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
      } else {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al cargar las zonas de cobertura",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarZonas();
  }, []);

  const handleCrearZona = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const coords = JSON.parse(coordenadasTexto);
      if (!Array.isArray(coords) || coords.length < 4) {
        throw new Error("Se requiere un arreglo de al menos 4 coordenadas [lng, lat]");
      }

      startTransition(async () => {
        try {
          const nueva = await coberturaApi.crearZona({
            nombre: nuevoNombre,
            coordenadas: coords,
          });
          setZonas((prev) => [nueva, ...prev]);
          setMostrarModal(false);
          setNuevoNombre("");
          setMensaje({
            tipo: "exito",
            texto: `Zona "${nueva.nombre}" creada y registrada con índice GiST exitosamente.`,
          });
        } catch (err: any) {
          setMensaje({
            tipo: "error",
            texto: err.message || "Error al guardar el polígono de cobertura",
          });
        }
      });
    } catch (parseErr: any) {
      setMensaje({
        tipo: "error",
        texto: "Formato de coordenadas inválido. Debe ser un JSON válido: [[lng, lat], ...]",
      });
    }
  };

  const handleEliminarZona = async (publicId: string, nombre: string) => {
    if (!confirm(`¿Desea desactivar la zona "${nombre}"?`)) return;

    startTransition(async () => {
      try {
        await coberturaApi.eliminarZona(publicId);
        setZonas((prev) =>
          prev.map((z) => (z.publicId === publicId ? { ...z, activa: false } : z))
        );
        setMensaje({
          tipo: "exito",
          texto: `Zona "${nombre}" desactivada.`,
        });
      } catch (err: any) {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al desactivar la zona",
        });
      }
    });
  };

  const handleVerificarSTCovers = async () => {
    try {
      setProbandoCobertura(true);
      const lat = parseFloat(testLat);
      const lng = parseFloat(testLng);
      const res = await coberturaApi.verificarCobertura(lat, lng);
      setResultadoTest(res);
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al verificar la cobertura espacial",
      });
    } finally {
      setProbandoCobertura(false);
    }
  };

  const usarUbicacionActual = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setTestLat(pos.coords.latitude.toFixed(4));
          setTestLng(pos.coords.longitude.toFixed(4));
        },
        () => {
          alert("No se pudo obtener la geolocalización actual del navegador.");
        }
      );
    }
  };

  const zonasActivas = zonas.filter((z) => z.activa).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
          onExito={cargarZonas}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
              <Compass className="size-3" /> PostGIS Spatial 4326
            </span>
            <span className="text-xs text-neutral-500 font-mono">Índice GiST</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Zonas de Cobertura y Despacho
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Define los polígonos geográficos de entrega para que los clientes en tu área puedan realizar pedidos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm"
          >
            <Plus className="size-4" />
            Nueva Zona Poligonal
          </button>
          <button
            onClick={cargarZonas}
            disabled={cargando || isPending}
            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
          >
            <RefreshCw className={`size-4 ${cargando ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {mensaje && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Total Polígonos</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950">
              <Layers className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2">{zonas.length}</div>
          <p className="text-xs text-neutral-400 mt-1">Zonas delimitadas</p>
        </div>

        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Zonas Activas</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
              <CheckCircle className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-600">{zonasActivas}</div>
          <p className="text-xs text-neutral-400 mt-1">Recibiendo pedidos</p>
        </div>

        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Zonas Inactivas</span>
            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800">
              <XCircle className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-neutral-500">
            {zonas.length - zonasActivas}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Despacho suspendido</p>
        </div>
      </div>

      {/* Comprobador de Cobertura ST_Covers en Vivo */}
      <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
              <MapPin className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Comprobador Geoespacial PostGIS (ST_Covers)</h3>
              <p className="text-xs text-neutral-500">
                Simula la coordenada de un cliente para verificar si está dentro de la zona de reparto.
              </p>
            </div>
          </div>
          <button
            onClick={usarUbicacionActual}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 transition"
          >
            <Navigation className="size-3.5" />
            Mi GPS Actual
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Latitud (WGS 84)
            </label>
            <input
              type="text"
              value={testLat}
              onChange={(e) => setTestLat(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background font-mono dark:border-neutral-700"
              placeholder="-11.9950"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Longitud (WGS 84)
            </label>
            <input
              type="text"
              value={testLng}
              onChange={(e) => setTestLng(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background font-mono dark:border-neutral-700"
              placeholder="-77.0650"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleVerificarSTCovers}
              disabled={probandoCobertura}
              className="w-full py-2 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 text-sm font-semibold transition"
            >
              {probandoCobertura ? "Verificando..." : "Comprobar ST_Covers"}
            </button>
          </div>
        </div>

        {/* Resultado del Comprobador */}
        {resultadoTest && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
              resultadoTest.tieneCobertura
                ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {resultadoTest.tieneCobertura ? (
                <CheckCircle className="size-6 text-emerald-600" />
              ) : (
                <XCircle className="size-6 text-rose-600" />
              )}
              <div>
                <p className="font-bold">
                  {resultadoTest.tieneCobertura
                    ? "¡Cobertura Confirmada para Entrega!"
                    : "Punto fuera de cobertura de despacho"}
                </p>
                <p className="text-xs opacity-90">
                  {resultadoTest.tieneCobertura
                    ? `${resultadoTest.totalDistribuidoras} distribuidora(s) cubren este punto exacto.`
                    : "No existen polígonos activos que cubran esta coordenada en la base de datos."}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold">
              [{resultadoTest.lat}, {resultadoTest.lng}]
            </span>
          </div>
        )}
      </div>

      {/* Tabla de Polígonos de Cobertura */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b dark:border-neutral-800 flex justify-between items-center">
          <h2 className="font-bold text-base">Polígonos Registrados en su Empresa</h2>
          <span className="text-xs text-neutral-500 font-mono">
            {zonas.length} zonas configuradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nombre de la Zona</th>
                <th className="px-6 py-3.5">Vértices (Puntos)</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5">Fecha Registro</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    Cargando zonas de cobertura...
                  </td>
                </tr>
              ) : zonas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No tiene zonas de cobertura registradas. Haga clic en "Nueva Zona Poligonal" para agregar una.
                  </td>
                </tr>
              ) : (
                zonas.map((z) => (
                  <tr key={z.publicId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition">
                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                      {z.nombre}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">
                      {z.coordenadas.length} vértices poligonales
                    </td>
                    <td className="px-6 py-4">
                      {z.activa ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <span className="size-1.5 rounded-full bg-emerald-500"></span>
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-500">
                      {new Date(z.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {z.activa && (
                        <button
                          onClick={() => handleEliminarZona(z.publicId, z.nombre)}
                          disabled={isPending}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 transition rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title="Desactivar Zona"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Zona */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Crear Zona de Cobertura PostGIS</h3>
                <p className="text-xs text-neutral-500">
                  Ingresa las coordenadas en formato GeoJSON `[[lng, lat], ...]`.
                </p>
              </div>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearZona} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nombre del Sector / Zona *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sector Los Olivos Norte"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Cargar Preset de Lima Metropolitana
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS_LIMA.map((preset) => (
                    <button
                      type="button"
                      key={preset.nombre}
                      onClick={() => {
                        setNuevoNombre(preset.nombre);
                        setCoordenadasTexto(JSON.stringify(preset.coordenadas, null, 2));
                      }}
                      className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
                    >
                      {preset.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Coordenadas GeoJSON (Polígono cerrado: primer y último punto idénticos) *
                </label>
                <textarea
                  required
                  rows={6}
                  value={coordenadasTexto}
                  onChange={(e) => setCoordenadasTexto(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border bg-background dark:border-neutral-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isPending ? "Guardando..." : "Crear Polígono"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
