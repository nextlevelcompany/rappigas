"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Flame, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/librerias/api/auth.api";
import { useAuthStore } from "@/store/auth-store";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const establecerSesion = useAuthStore((state) => state.establecerSesion);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const respuesta = await authApi.login({ email, password });
      establecerSesion(respuesta);

      // Redirección inteligente segmentada según el rol del usuario
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

  const rellenarCredencialPrueba = (emailPrueba: string, passPrueba: string) => {
    setEmail(emailPrueba);
    setPassword(passPrueba);
    setError(null);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border/60 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/20">
              <Flame className="size-6 text-primary animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Iniciar Sesión en PideGas</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@pidegas.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={cargando}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <a
                  href="/auth/basic/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={cargando}
                  className="pr-10 bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar" : "Mostrar"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={cargando}>
              {cargando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Entrar al Sistema"
              )}
            </Button>
          </form>

          {/* Cuentas de demostración pre-configuradas */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground text-center mb-3">
              Credenciales de prueba rápida (MVP):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => rellenarCredencialPrueba("admin@pidegas.pe", "AdminPassword123!")}
              >
                Super Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => rellenarCredencialPrueba("empresa@pidegas.pe", "EmpresaPassword123!")}
              >
                Distribuidora de Gas
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => rellenarCredencialPrueba("cliente@pidegas.pe", "ClientePassword123!")}
              >
                Cliente
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => rellenarCredencialPrueba("repartidor@pidegas.pe", "RepartidorPassword123!")}
              >
                Repartidor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground">
        PideGas Platform © 2026. Todos los derechos reservados.
      </div>
    </div>
  );
}
