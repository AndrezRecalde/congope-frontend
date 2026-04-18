import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/ui/AppShell/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar cookie de sesión en el servidor
  const cookieStore = await cookies();
  const token = cookieStore.get("congope_token");

  // Sin token → redirigir al login
  // El parámetro redirect permite volver a la
  // página original tras autenticarse
  if (!token) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
