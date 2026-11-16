"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/librerias/api/auth.api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export function RegistroClienteForm({
  className,
  onSwitchToLogin,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  onSwitchToLogin?: () => void;
}) {
  const router = useRouter();
  const [returnUrl, setReturnUrl] = useState("/cliente/tienda");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        setReturnUrl(redirect);
      }
    }
  }, []);
  const establecerSesion = useAuthStore((state) => state.establecerSesion);

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombres.trim() || !apellidos.trim()) {
      setError("Por favor, ingresa tus nombres y apellidos completos.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener un mínimo de 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones de RappiGas.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await authApi.registroCliente({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim() || undefined,
        password,
      });

      establecerSesion(respuesta);

      toast.success("¡Cuenta creada exitosamente!", {
        description: `Bienvenido a RappiGas, ${respuesta.nombres}. ¡Empieza a acumular RappiPuntos con tus pedidos!`,
        duration: 4000,
      });

      router.push(returnUrl);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al registrar tu cuenta. El correo podría estar ya en uso.";
      setError(errorMsg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      {/* Banner de beneficios del cliente */}
      <div className="p-3 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Award className="size-4" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-orange-950 dark:text-orange-200">
            ¡Gana RappiPuntos desde tu 1er pedido!
          </p>
          <p className="text-[11px] text-orange-800/80 dark:text-orange-300/80">
            Pesa tu balón en puerta y canjea electrodomésticos y recargas.
          </p>
        </div>
      </div>

      <form onSubmit={handleRegistro} className="space-y-3.5">
        {error && (
          <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2.5 animate-in fade-in-50">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Nombres y Apellidos en 2 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="reg-nombres" className="text-xs font-semibold text-foreground">
              Nombres *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="reg-nombres"
                type="text"
                placeholder="Ej. Juan Carlos"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                required
                disabled={cargando}
                className="pl-9 h-9.5 bg-background/80 border-border/80 text-sm rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-apellidos" className="text-xs font-semibold text-foreground">
              Apellidos *
            </Label>
            <Input
              id="reg-apellidos"
              type="text"
              placeholder="Ej. Pérez Gómez"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
              disabled={cargando}
              className="h-9.5 bg-background/80 border-border/80 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Correo Electrónico */}
        <div className="space-y-1">
          <Label htmlFor="reg-email" className="text-xs font-semibold text-foreground">
            Correo Electrónico *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="reg-email"
              type="email"
              placeholder="tucorreo@ejemplo.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={cargando}
              className="pl-9 h-9.5 bg-background/80 border-border/80 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Teléfono / Celular */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="reg-telefono" className="text-xs font-semibold text-foreground">
              Celular / WhatsApp
            </Label>
            <span className="text-[10px] text-muted-foreground">Para coordinar entrega</span>
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="reg-telefono"
              type="tel"
              placeholder="987 654 321"
              value={telefono}
              maxLength={12}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={cargando}
              className="pl-9 h-9.5 bg-background/80 border-border/80 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Contraseña y Confirmación en 2 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="reg-password" className="text-xs font-semibold text-foreground">
              Contraseña *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Mín. 6 caract."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={cargando}
                className="pl-9 pr-8 h-9.5 bg-background/80 border-border/80 text-sm rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md"
                aria-label="Ver u ocultar contraseña"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-confirm" className="text-xs font-semibold text-foreground">
              Confirmar *
            </Label>
            <Input
              id="reg-confirm"
              type={showPassword ? "text" : "password"}
              placeholder="Repite clave"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={cargando}
              className="h-9.5 bg-background/80 border-border/80 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Checkbox de Términos */}
        <div className="flex items-start space-x-2 pt-1">
          <Checkbox
            id="terminos"
            checked={aceptaTerminos}
            onCheckedChange={(checked) => setAceptaTerminos(Boolean(checked))}
            className="mt-0.5"
          />
          <label
            htmlFor="terminos"
            className="text-[11px] text-muted-foreground leading-tight cursor-pointer select-none"
          >
            Acepto los Términos de Servicio y deseo acumular RappiPuntos canjeables por balones y premios.
          </label>
        </div>

        {/* Botón de Enviar */}
        <Button
          type="submit"
          className="w-full h-10 font-bold text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer rounded-lg"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Creando cuenta de cliente...</span>
            </>
          ) : (
            <>
              <span>Registrarme como Cliente</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Pie de cambio a Iniciar Sesión */}
      <div className="pt-2 border-t border-border/60 text-center text-xs text-muted-foreground">
        ¿Ya tienes una cuenta registrada?{" "}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            Inicia Sesión aquí
          </button>
        ) : (
          <a href="/auth/login" className="font-semibold text-primary hover:underline">
            Inicia Sesión aquí
          </a>
        )}
      </div>
    </div>
  );
}
