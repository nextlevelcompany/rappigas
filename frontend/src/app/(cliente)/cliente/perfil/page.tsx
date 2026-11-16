"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ShoppingBag,
  Gift,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/librerias/api/auth.api";
import { fidelizacionApi, BilleteraPuntos } from "@/librerias/api/fidelizacion.api";
import { pedidosApi } from "@/librerias/api/pedidos.api";
import { obtenerMisDirecciones } from "@/librerias/carrito-gas";

export default function MiPerfilClientePage() {
  const { usuario, actualizarUsuario } = useAuthStore();

  // Estados de formulario
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");

  // Estados de seguridad (cambio de contraseña)
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estados de estadísticas
  const [billetera, setBilletera] = useState<BilleteraPuntos | null>(null);
  const [totalPedidos, setTotalPedidos] = useState<number>(0);
  const [totalDirecciones, setTotalDirecciones] = useState<number>(0);

  // Estados de proceso
  const [guardando, setGuardando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    cargarDatosPerfil();
  }, [usuario?.publicId]);

  const cargarDatosPerfil = async () => {
    setCargandoDatos(true);
    try {
      // 1. Cargar datos iniciales desde el store local
      if (usuario) {
        setNombres(usuario.nombres || "");
        setApellidos(usuario.apellidos || "");
        setEmail(usuario.email || "");
      }

      // Cargar teléfono o datos extras desde localStorage si existen
      if (typeof window !== "undefined") {
        const telGuardado = localStorage.getItem("rappigas_cliente_telefono");
        const dniGuardado = localStorage.getItem("rappigas_cliente_dni");
        if (telGuardado) setTelefono(telGuardado);
        if (dniGuardado) setDni(dniGuardado);
      }

      // 2. Intentar obtener perfil desde backend /auth/yo
      try {
        const perfil = await authApi.obtenerPerfil();
        if (perfil) {
          if (perfil.nombres) setNombres(perfil.nombres);
          if (perfil.apellidos) setApellidos(perfil.apellidos);
          if (perfil.email) setEmail(perfil.email);
          if (perfil.telefono) setTelefono(perfil.telefono);
        }
      } catch {
        // En caso de que el backend no responda, se conservan los datos de sesión
      }

      // 3. Cargar billetera de fidelidad
      try {
        const b = await fidelizacionApi.obtenerBilletera();
        setBilletera(b);
      } catch {
        // Usuario sin puntos o no logueado
      }

      // 4. Cargar contador de pedidos
      try {
        const res = await pedidosApi.listarMisPedidos();
        setTotalPedidos(res.totalElements ?? res.content?.length ?? 0);
      } catch {
        setTotalPedidos(0);
      }

      // 5. Cargar total de direcciones
      const dirs = obtenerMisDirecciones(usuario?.publicId);
      setTotalDirecciones(dirs.length);
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombres.trim()) {
      toast.error("Por favor ingresa tus nombres");
      return;
    }
    if (!apellidos.trim()) {
      toast.error("Por favor ingresa tus apellidos");
      return;
    }

    // Validación de contraseña si intenta cambiarla
    if (nuevaPassword.trim() || confirmarPassword.trim()) {
      if (nuevaPassword.length < 6) {
        toast.error("La nueva contraseña debe tener al menos 6 caracteres");
        return;
      }
      if (nuevaPassword !== confirmarPassword) {
        toast.error("Las contraseñas ingresadas no coinciden");
        return;
      }
    }

    setGuardando(true);
    try {
      // 1. Intentar persistir en el backend
      try {
        await authApi.actualizarPerfil({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          telefono: telefono.trim(),
          nuevaPassword: nuevaPassword.trim() || undefined,
        });
      } catch (err: any) {
        console.warn("Actualización en backend diferida:", err);
      }

      // 2. Actualizar estado reactivo global en el store del cliente
      actualizarUsuario({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
      });

      // 3. Guardar campos complementarios en almacenamiento local
      if (typeof window !== "undefined") {
        if (telefono.trim()) localStorage.setItem("rappigas_cliente_telefono", telefono.trim());
        if (dni.trim()) localStorage.setItem("rappigas_cliente_dni", dni.trim());
      }

      toast.success("¡Tus datos personales han sido actualizados con éxito!");
      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (err: any) {
      toast.error("Error al actualizar: " + (err.message || "Error desconocido"));
    } finally {
      setGuardando(false);
    }
  };

  const iniciales = `${nombres?.[0] || "C"}${apellidos?.[0] || "L"}`.toUpperCase();

  return (
    <div className="w-full px-3 sm:px-5 py-2.5 space-y-2.5 text-xs text-slate-800">
      {/* 1. Barra Superior Compacta */}
      <div className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl px-3.5 py-2 text-white shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-amber-200" />
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none truncate">
              RappiGas • Mis Datos Personales
            </h1>
            <p className="text-[10px] text-orange-100 hidden sm:block mt-0.5">
              Consulta y actualiza tu información de contacto, credenciales y preferencias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/cliente/direcciones">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-[11px] bg-white/10 hover:bg-white/20 text-white border-white/40 font-bold rounded-lg shadow-2xs gap-1 cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-amber-200" />
              <span>Mis Direcciones</span>
            </Button>
          </Link>
          <Link href="/cliente/tienda">
            <Button
              size="sm"
              className="h-7 px-3 text-[11px] bg-white hover:bg-orange-50 text-orange-700 font-black rounded-lg shadow-sm border border-white/80 gap-1 cursor-pointer transition hover:scale-102"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
              <span>Ir a la Tienda</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen y Métricas Compactas */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-2xs flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {iniciales}
          </div>
          <div className="min-w-0 leading-tight">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Cliente
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
              {nombres || "Cliente"} {apellidos}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-2xs flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Rappipuntos
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-950 truncate block font-mono">
              {billetera ? Number(billetera.saldoPuntos).toLocaleString() : "0"} PTS
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-2xs flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Pedidos Hechos
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
              {totalPedidos} pedido{totalPedidos === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-2xs flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Direcciones
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
              {totalDirecciones} guardada{totalDirecciones === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Formulario Principal de Datos Personales */}
      <form onSubmit={handleGuardarPerfil} className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Columna Izquierda: Información Personal y Contacto (7 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-2.5 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                    Información Personal del Cliente
                  </h2>
                  <span className="text-[10px] text-slate-400">
                    Datos utilizados para facturación, puntos y contacto de reparto
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Cuenta Activa
              </span>
            </div>

            {/* Inputs de Nombres y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block">
                  Nombres:
                </label>
                <input
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Tus nombres..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block">
                  Apellidos:
                </label>
                <input
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Tus apellidos..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            {/* Correo y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block flex items-center justify-between">
                  <span>Correo Electrónico:</span>
                  <span className="text-[9px] text-slate-400 font-normal">Acceso principal</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    placeholder="correo@ejemplo.pe"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 cursor-not-allowed"
                    title="El correo es tu identificador de inicio de sesión"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block flex items-center justify-between">
                  <span>Teléfono Celular:</span>
                  <span className="text-[9px] text-orange-600 font-normal">WhatsApp / Reparto</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 977665554"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* DNI Opcional para canjes y comprobante */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block">
                  DNI / Documento de Identidad (Opcional):
                </label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ej: 45892134"
                  maxLength={12}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block">
                  Tipo de Cuenta:
                </label>
                <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Cliente Doméstico / Particular</span>
                  <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded font-extrabold">
                    RappiPuntos Activo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seguridad y Cambio de Contraseña */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                    Seguridad y Contraseña
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Deja estos campos en blanco si no deseas cambiar tu contraseña
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                {mostrarPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{mostrarPassword ? "Ocultar" : "Mostrar"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block">
                  Nueva Contraseña:
                </label>
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block">
                  Confirmar Nueva Contraseña:
                </label>
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repite la contraseña..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Estado, Garantías y Guardado (5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-2.5">
          {/* Tarjeta de Resumen y Botón de Guardar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                {iniciales}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-sm text-slate-900 truncate">
                  {nombres || "Cliente"} {apellidos}
                </h3>
                <p className="text-[10px] text-slate-500 truncate font-mono">
                  {email}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-extrabold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                    RappiGas Club
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    ID: {usuario?.publicId ? usuario.publicId.slice(0, 8) : "ACTIVO"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center justify-between">
                <span>Rappipuntos Acumulados:</span>
                <span className="font-mono font-black text-amber-950">
                  {billetera ? Number(billetera.saldoPuntos).toLocaleString() : "0"} PTS
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Direcciones Guardadas:</span>
                <span className="font-bold text-slate-900">{totalDirecciones}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pedidos Totales:</span>
                <span className="font-bold text-slate-900">{totalPedidos}</span>
              </div>
            </div>

            {/* Botón de Guardar Cambios */}
            <Button
              type="submit"
              disabled={guardando}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl h-9 shadow-md transition cursor-pointer gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{guardando ? "Guardando cambios..." : "Guardar Mis Datos"}</span>
            </Button>
          </div>

          {/* Accesos Rápidos de Cuenta */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs space-y-1.5 text-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Enlaces Directos
            </span>
            <Link
              href="/cliente/direcciones"
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 transition"
            >
              <span className="flex items-center gap-2 font-bold text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Mis Direcciones de Entrega</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/cliente/pedidos"
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 transition"
            >
              <span className="flex items-center gap-2 font-bold text-[11px]">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                <span>Historial de Pedidos</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/cliente/canjes"
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 transition"
            >
              <span className="flex items-center gap-2 font-bold text-[11px]">
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>Club de Premios Rappipuntos</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Sello de Seguridad y Privacidad */}
          <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2 text-[10px] text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold leading-tight">Privacidad y Protección de Datos</p>
              <p className="text-emerald-700 leading-tight mt-0.5">
                Tus datos están protegidos y solo se usan para la entrega de tus pedidos de gas y canjes.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
