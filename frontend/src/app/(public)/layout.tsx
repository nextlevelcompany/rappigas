import { Toaster } from "sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      {children}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
