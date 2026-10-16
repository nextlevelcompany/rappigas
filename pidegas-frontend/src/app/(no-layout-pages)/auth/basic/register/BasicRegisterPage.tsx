import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { SignupForm } from "@/components/signup-form"

export default function BasicRegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" title="Ir a PideGas" className="flex items-center justify-center self-center hover:opacity-90 transition">
          <BrandLogo size="lg" />
        </Link>
        <SignupForm />
      </div>
    </div>
  )
}
