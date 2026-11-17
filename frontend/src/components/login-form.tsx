"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Building2,
  Truck,
  User,
  ArrowRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/librerias/api/auth.api";
import { useAuthStore } from "@/store/auth-store";

const DEMO_ACCOUNTS = [
  {
    id: "cliente",
    label: "Cliente",
    sublabel: "Hogar",
    email: "cliente@pidegas.pe",
    pass: "ClientePassword123!",
    icon: User,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-500/20",
  },
  {
    id: "empresa",
    label: "Distribuidora",
    sublabel: "Despacho",
    email: "empresa@pidegas.pe",
    pass: "EmpresaPassword123!",
    icon: Building2,
    iconColor: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    border: "border-orange-500/20",
  },
  {
    id: "repartidor",
    label: "Repartidor",
    sublabel: "En Ruta",
    email: "repartidor@pidegas.pe",
    pass: "RepartidorPassword123!",
    icon: Truck,
    iconColor: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-blue-500/20",
  },
];

export function LoginForm({
  className,
  onSwitchToRegister,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  onSwitchToRegister?: () => void;
}) {
  const router = useRouter();
  const establecerSesion = useAuthStore((state) => state.establecerSesion);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const respuesta = await authApi.login({ email, password });
      establecerSesion(respuesta);

      // Redirección inteligente según el rol del usuario
      switch (respuesta.rol) {
        case "CLIENTE":
          router.push("/cliente/pedidos");
          break;
        case "EMPRESA":
          router.push("/empresa/dashboard");
          break;
        case "REPARTIDOR":
          router.push("/repartidor/pedidos");
          break;
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesión. Verifica la conexión con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  const rellenarCredencialPrueba = (id: string, emailPrueba: string, passPrueba: string) => {
    setEmail(emailPrueba);
    setPassword(passPrueba);
    setSelectedDemoId(id);
    setError(null);
  };

  const handleGoogleLogin = () => {
    toast.info("Ingreso con Google", {
      description: "Para habilitar el inicio de sesión con Google, se vinculan las credenciales OAuth en Google Cloud Console. Por ahora puedes ingresar con tu correo y contraseña.",
    });
  };

  return (
    <div className={cn("w-full space-y-3.5", className)} {...props}>
      <form onSubmit={handleLogin} className="space-y-3">
        {error && (
          <div className="p-2.5 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 animate-in fade-in-50">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground">
            Correo Electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="nombre@rappigas.pe"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedDemoId(null);
              }}
              required
              disabled={cargando}
              className="pl-9 h-9 bg-background border-border/80 text-xs sm:text-sm rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground">
              Contraseña
            </Label>
            <a
              href="/auth/basic/forgot-password"
              className="text-[11px] text-primary font-medium hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setSelectedDemoId(null);
              }}
              required
              disabled={cargando}
              className="pl-9 pr-9 h-9 bg-background border-border/80 text-xs sm:text-sm rounded-lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
              aria-label={showPassword ? "Ocultar" : "Mostrar"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-0.5">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
          />
          <label
            htmlFor="remember"
            className="text-[11px] text-muted-foreground font-normal cursor-pointer select-none"
          >
            Recordar mi sesión en este dispositivo
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-9.5 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <span>Iniciar Sesión</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>

        {/* Separador de Google */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border/60" />
          <span className="flex-shrink mx-2 text-[10px] font-medium text-muted-foreground uppercase">
            o ingresa con
          </span>
          <div className="flex-grow border-t border-border/60" />
        </div>

        {/* Botón de Google */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full h-9 font-medium text-xs border-border/80 hover:bg-muted/50 flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continuar con Google</span>
        </Button>
      </form>

      {/* Selector de los 3 accesos oficiales */}
      <div className="pt-1">
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border/60" />
          <span className="flex-shrink mx-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Accesos de Prueba
          </span>
          <div className="flex-grow border-t border-border/60" />
        </div>

        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {DEMO_ACCOUNTS.map((acc) => {
            const isSelected = selectedDemoId === acc.id || email === acc.email;
            const Icon = acc.icon;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => rellenarCredencialPrueba(acc.id, acc.email, acc.pass)}
                className={cn(
                  "flex flex-col items-center justify-center p-1.5 rounded-lg text-center transition-all border text-[11px] cursor-pointer group",
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30 shadow-xs"
                    : "border-border/60 hover:border-border hover:bg-muted/50 bg-card"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-md mb-1 transition-colors",
                    acc.bg,
                    acc.iconColor
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
                <span className="font-semibold text-foreground text-[11px] leading-tight truncate w-full">
                  {acc.label}
                </span>
                <span className="text-[9px] text-muted-foreground truncate w-full">
                  {acc.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-border/60 text-center text-[11px] text-muted-foreground">
        <div>
          ¿No tienes cuenta?{" "}
          {onSwitchToRegister ? (
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              Crear cuenta de cliente
            </button>
          ) : (
            <a
              href="/auth/registro-cliente"
              className="font-bold text-orange-600 dark:text-orange-400 hover:underline"
            >
              Crear cuenta de cliente
            </a>
          )}
        </div>
        <div>
          ¿Eres distribuidora?{" "}
          <a
            href="/auth/registro-empresa"
            className="font-semibold text-primary hover:underline transition-colors"
          >
            Afiliar Distribuidora
          </a>
        </div>
      </div>
    </div>
  );
}
