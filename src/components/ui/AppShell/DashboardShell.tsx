"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAppSelector } from "@/store/hooks";
import { selectSidebarAbierto } from "@/store/slices/uiSlice";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const sidebarAbierto = useAppSelector(selectSidebarAbierto);

  // Estado independiente para el drawer móvil (empieza cerrado)
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure(false);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: sidebarAbierto ? 260 : 68,
        breakpoint: "sm",
        collapsed: {
          // Móvil: controlado por mobileOpened (drawer)
          mobile: !mobileOpened,
          // Desktop: nunca colapsar totalmente, siempre muestra iconos o expandido
          desktop: false,
        },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: "var(--color-bg-page, var(--mantine-color-body))",
          minHeight: "calc(100vh - 60px)",
        },
        navbar: {
          borderRight: "1px solid var(--mantine-color-default-border)",
          backgroundColor: "var(--mantine-color-body)",
          transition: "width 250ms ease",
          overflow: "hidden",
        },
        header: {
          borderBottom: "1px solid var(--mantine-color-default-border)",
          backgroundColor: "var(--mantine-color-body)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        },
      }}
    >
      <AppShell.Header>
        <Topbar mobileOpened={mobileOpened} toggleMobile={toggleMobile} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar onNavigate={closeMobile} mobileDrawerOpen={mobileOpened} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
