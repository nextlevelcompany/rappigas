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
  ShieldCheck,
  Building2,
  Truck,
  User,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/librerias/api/auth.api";
import { useAuthStore } from "@/store/auth-store";

const DEMO_ACCOUNTS = [
  {
    id: "admin",
    label: "Super Admin",
    sublabel: "Plataforma Global",
    email: "admin@pidegas.pe",
    pass: "AdminPassword123!",
    icon: ShieldCheck,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    border: "border-indigo-500/20",
  },
  {
    id: "empresa",
    label: "Distribuidora",
    sublabel: "Despacho y Ventas",
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
    sublabel: "Ruta y Entregas",
    email: "repartidor@pidegas.pe",
    pass: "RepartidorPassword123!",
    icon: Truck,
    iconColor: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-blue-500/20",
  },
  {
    id: "cliente",
    label: "Cliente",
    sublabel: "Pedidos de Balón",
    email: "cliente@pidegas.pe",
    pass: "ClientePassword123!",
    icon: User,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-500/20",
  },
];

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
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

  return (
    <div className={cn("w-full space-y-5", className)} {...props}>
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2.5 animate-in fade-in-50">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground">
            Correo Electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
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
              className="pl-10 h-10 bg-background/80 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/20 text-sm rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground">
              Contraseña
            </Label>
            <a
              href="/auth/basic/forgot-password"
              className="text-xs text-primary font-medium hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
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
              className="pl-10 pr-10 h-10 bg-background/80 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/20 text-sm rounded-lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
              aria-label={showPassword ? "Ocultar" : "Mostrar"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
            className="text-xs text-muted-foreground font-normal cursor-pointer select-none"
          >
            Mantener mi sesión activa en este equipo
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-10.5 font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group cursor-pointer rounded-lg"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Verificando credenciales...</span>
            </>
          ) : (
            <>
              <span>Iniciar Sesión en RappiGas</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      {/* Selector de cuentas de demostración */}
      <div className="pt-2">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border/70" />
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Accesos de Prueba (Demo)
          </span>
          <div className="flex-grow border-t border-border/70" />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const isSelected = selectedDemoId === acc.id || email === acc.email;
            const Icon = acc.icon;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => rellenarCredencialPrueba(acc.id, acc.email, acc.pass)}
                className={cn(
                  "flex items-center gap-2.5 p-2 rounded-lg text-left transition-all border text-xs cursor-pointer group",
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30 shadow-xs"
                    : "border-border/60 hover:border-border hover:bg-muted/50 bg-card"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-md shrink-0 transition-colors",
                    acc.bg,
                    acc.iconColor
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground truncate flex items-center justify-between">
                    <span>{acc.label}</span>
                    {isSelected && <Check className="size-3 text-primary shrink-0" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {acc.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-1">
        ¿Deseas afiliar tu empresa a la red?{" "}
        <a
          href="/auth/registro-empresa"
          className="font-semibold text-primary hover:underline transition-colors"
        >
          Afiliar Distribuidora
        </a>
      </div>
    </div>
  );
}
