"use client";

import {
  SimpleGrid,
  Grid,
  Stack,
  Paper,
  Group,
  Text,
  Title,
  Badge,
  ThemeIcon,
  Button,
} from "@mantine/core";
import {
  IconFolderOpen,
  IconBuildingBank,
  IconStar,
  IconNetwork,
  IconFileAlert,
  IconFlagExclamation,
  IconClockExclamation,
  IconTrendingUp,
  IconPlus,
  IconUpload,
} from "@tabler/icons-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AlertaCard } from "@/components/dashboard/AlertaCard";
import { GraficaAnual } from "@/components/dashboard/GraficaAnual";
import { GraficaOds } from "@/components/dashboard/GraficaOds";
import { GraficaActores } from "@/components/dashboard/GraficaActores";
import { CompromisosPendientes } from "@/components/dashboard/CompromisosPendientes";
import { ProyectosDestacados } from "@/components/dashboard/ProyectosDestacados";
import { MapaCalorOds } from "@/components/modulos/dashboard/MapaCalorOds";
import { useDashboard } from "@/queries/dashboard.queries";
import { useAppSelector } from "@/store/hooks";
import { selectUsuario } from "@/store/slices/authSlice";

export default function DashboardPage() {
  const usuario = useAppSelector(selectUsuario);
  const { data, isLoading } = useDashboard();

  const kpis = data?.kpis;
  const alertas = data?.alertas;

  // Saludo según la hora del día
  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  // Formatear monto total
  // monto_total viene como string según el OpenAPI
  const montoFormateado = kpis?.proyectos?.monto_total
    ? new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(parseFloat(kpis.proyectos.monto_total))
    : "—";

  // Desglose de actores por tipo — disponible para uso futuro
  void Object.entries(kpis?.actores?.por_tipo ?? {});

  return (
    <>
      {/* Estilos para animaciones de entrada fluidas (Staggered Animation) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `,
        }}
      />

      <PageHeader
        titulo={`${saludo}, ${usuario?.name?.split(" ")[0] ?? "Usuario"}`}
        descripcion="Resumen ejecutivo de cooperación internacional y nacional del CONGOPE"
        acciones={
          <Group gap="sm">
            <Button
              component={Link}
              href="/proyectos/nuevo"
              leftSection={<IconPlus size={16} />}
              color="congope"
            >
              Nuevo Proyecto
            </Button>
            <Button
              component={Link}
              href="/documentos"
              variant="default"
              leftSection={<IconUpload size={16} />}
            >
              Subir Documental
            </Button>
            <Badge
              color="green"
              variant="light"
              size="lg"
              ml="md"
              leftSection={<IconTrendingUp size={14} />}
            >
              Sistema activo
            </Badge>
          </Group>
        }
      />

      {/* ── Alertas de gestión ── */}
      {alertas &&
        (alertas.documentos_venciendo > 0 ||
          alertas.hitos_vencidos > 0 ||
          alertas.compromisos_pendientes > 0) && (
          <div className="animate-fade-up">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="md">
              <AlertaCard
                label="Documentos por vencer"
                valor={alertas.documentos_venciendo ?? 0}
                icono={<IconFileAlert size={18} />}
                color="orange"
                href="/documentos"
              />
              <AlertaCard
                label="Hitos vencidos"
                valor={alertas.hitos_vencidos ?? 0}
                icono={<IconFlagExclamation size={18} />}
                color="red"
                href="/proyectos"
              />
              <AlertaCard
                label="Compromisos pendientes"
                valor={alertas.compromisos_pendientes ?? 0}
                icono={<IconClockExclamation size={18} />}
                color="yellow"
              />
            </SimpleGrid>
          </div>
        )}

      {/* ── KPIs principales ── */}
      <div className="animate-fade-up delay-100">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
          <KpiCard
            titulo="Proyectos"
            valor={isLoading ? "—" : (kpis?.proyectos?.total ?? 0)}
            subtitulo={
              isLoading
                ? ""
                : `${kpis?.proyectos?.en_ejecucion ?? 0} en ejecución · ` +
                  `${kpis?.proyectos?.en_gestion ?? 0} en gestión`
            }
            icono={<IconFolderOpen size={22} />}
            color="blue"
            href="/proyectos"
            isLoading={isLoading}
            badge={
              kpis?.proyectos?.finalizados
                ? {
                    label: `${kpis.proyectos.finalizados} finalizados`,
                    color: "green",
                  }
                : undefined
            }
          />

          <KpiCard
            titulo="Actores cooperantes"
            valor={isLoading ? "—" : (kpis?.actores?.total ?? 0)}
            subtitulo={
              isLoading ? "" : `${kpis?.actores?.activos ?? 0} activos`
            }
            icono={<IconBuildingBank size={22} />}
            color="teal"
            href="/actores"
            isLoading={isLoading}
          />

          <KpiCard
            titulo="Buenas prácticas"
            valor={isLoading ? "—" : (kpis?.practicas?.total ?? 0)}
            subtitulo={
              isLoading ? "" : `${kpis?.practicas?.destacadas ?? 0} destacadas`
            }
            icono={<IconStar size={22} />}
            color="orange"
            href="/buenas-practicas"
            isLoading={isLoading}
          />

          <KpiCard
            titulo="Redes activas"
            valor={isLoading ? "—" : (kpis?.redes?.total ?? 0)}
            subtitulo="Redes de articulación"
            icono={<IconNetwork size={22} />}
            color="violet"
            href="/redes"
            isLoading={isLoading}
          />
        </SimpleGrid>
      </div>

      {/* ── Monto total de cooperación ── */}
      {!isLoading && kpis?.proyectos?.monto_total && (
        <div className="animate-fade-up delay-200">
          <Paper
            p="md"
            radius="lg"
            mb="xl"
            style={{
              background:
                "linear-gradient(135deg, " + "#1A3A5C 0%, #2E6DA4 100%)",
              border: "none",
            }}
          >
            <Group justify="space-between" align="center">
              <Stack gap={4}>
                <Text
                  size="xs"
                  c="rgba(255,255,255,0.7)"
                  fw={500}
                  tt="uppercase"
                  style={{ letterSpacing: "0.08em" }}
                >
                  Inversión total en cooperación
                </Text>
                <Title order={2} c="white" fw={700}>
                  {montoFormateado}
                </Title>
              </Stack>
              <ThemeIcon
                size={56}
                radius="xl"
                style={{
                  background: "rgba(255,255,255,0.15)",
                }}
                variant="filled"
                color="white"
              >
                <IconTrendingUp size={28} />
              </ThemeIcon>
            </Group>
          </Paper>
        </div>
      )}

      {/* ── Gráficas y datos secundarios ── */}
      <div className="animate-fade-up delay-300">
        <Grid gutter="md">
          {/* Gráfica anual — ocupa 2/3 del ancho */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <GraficaAnual />
          </Grid.Col>

          {/* Actores donut — ocupa 1/3 del ancho */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <GraficaActores />
          </Grid.Col>

          {/* Gráfica ODS — ancho completo */}
          <Grid.Col span={12}>
            <GraficaOds />
          </Grid.Col>

          {/* Compromisos pendientes — 1/3 ancho */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <CompromisosPendientes />
          </Grid.Col>

          {/* Proyectos Destacados */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <ProyectosDestacados />
          </Grid.Col>

          {/* ── Mapa de calor ODS × Provincia ── */}
          <Grid.Col span={12}>
            <div className="scroll-reveal">
              <MapaCalorOds />
            </div>
          </Grid.Col>
        </Grid>
      </div>
    </>
  );
}
