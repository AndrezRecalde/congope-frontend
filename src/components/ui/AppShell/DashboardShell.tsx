"use client";

import { AppShell } from "@mantine/core";
import { useAppSelector } from "@/store/hooks";
import { selectSidebarAbierto } from "@/store/slices/uiSlice";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const sidebarAbierto = useAppSelector(selectSidebarAbierto);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: sidebarAbierto ? 260 : 68,
        breakpoint: "sm",
        collapsed: { mobile: !sidebarAbierto },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: "var(--mantine-color-gray-0)",
          minHeight: "calc(100vh - 60px)",
        },
        navbar: {
          borderRight: "1px solid var(--mantine-color-gray-3)",
          backgroundColor: "#FFFFFF",
          transition: "width 250ms ease",
          overflow: "hidden",
        },
        header: {
          borderBottom: "1px solid var(--mantine-color-gray-3)",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        },
      }}
    >
      <AppShell.Header>
        <Topbar />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
