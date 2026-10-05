import { Flame } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export default function BasicLoginPage() {
  return (
    <div className="bg-muted min-h-svh w-full flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 font-bold text-2xl tracking-tight">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl shadow-md">
              <Flame className="size-5" />
            </div>
            <span className="text-xl font-extrabold text-foreground">Pide<span className="text-primary">Gas</span></span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
