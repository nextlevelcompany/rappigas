import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen">
      {children}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
