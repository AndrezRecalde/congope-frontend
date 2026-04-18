"use client";

import { SimpleGrid, Stack, Title, Text, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { ReporteCard } from "@/components/modulos/reportes/ReporteCard";
import { reportesService } from "@/services/reportes.service";
import { usePermisos } from "@/hooks/usePermisos";

// Configuración de los 5 reportes disponibles
const REPORTES_CONFIG = [
  {
    id: "provincia",
    titulo: "Reporte por Provincia",
    descripcion:
      "Informe detallado de todos los proyectos, actores cooperantes, buenas prácticas y eventos de una provincia específica. Incluye montos totales de inversión y estado de avance.",
    icono: "IconMap",
    color: "blue",
    permiso: "reportes.generar",
  },
  {
    id: "ods",
    titulo: "Reporte por ODS",
    descripcion:
      "Análisis de los proyectos alineados con un Objetivo de Desarrollo Sostenible específico. Muestra distribución provincial, montos y actores involucrados.",
    icono: "IconLeaf",
    color: "green",
    permiso: "reportes.generar",
  },
  {
    id: "cooperante",
    titulo: "Reporte por Cooperante",
    descripcion:
      "Historial completo de proyectos, inversiones y actividades de un actor cooperante específico con los GAD Provinciales del Ecuador.",
    icono: "IconBuildingBank",
    color: "teal",
    permiso: "reportes.generar",
  },
  {
    id: "anual",
    titulo: "Reporte Anual",
    descripcion:
      "Consolidado de cooperación internacional del CONGOPE para un año específico. Incluye todos los proyectos, montos, provincias beneficiadas y ODS alcanzados.",
    icono: "IconCalendar",
    color: "violet",
    permiso: "reportes.exportar_masivo",
  },
  {
    id: "global",
    titulo: "Reporte Global",
    descripcion:
      "Informe ejecutivo completo de toda la cooperación internacional y nacional del CONGOPE. Documento oficial para presentación ante autoridades y organismos internacionales.",
    icono: "IconWorld",
    color: "congope",
    permiso: "reportes.exportar_masivo",
  },
] as const;

export default function ReportesPage() {
  const { can } = usePermisos();

  const puedeGenerar = can("reportes.generar");
  const puedeExportarMasivo = can("reportes.exportar_masivo");

  // Función que despacha al service correcto
  const handleGenerar = async (
    tipoId: string,
    params: Record<string, unknown>,
  ) => {
    switch (tipoId) {
      case "provincia":
        await reportesService.provincia(params.provincia_id as string);
        break;
      case "ods":
        await reportesService.ods(params.ods_id as number);
        break;
      case "cooperante":
        await reportesService.cooperante(params.actor_id as string);
        break;
      case "anual":
        await reportesService.anual(params.anio as string);
        break;
      case "global":
        await reportesService.global();
        break;
    }
  };

  return (
    <>
      <PageHeader
        titulo="Reportería"
        descripcion="Generación y descarga de reportes oficiales de cooperación internacional del CONGOPE"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Reportes" },
        ]}
      />

      {/* Información general */}
      <Alert
        icon={<IconInfoCircle size={16} />}
        color="blue"
        variant="light"
        radius="md"
        mb="xl"
      >
        <Text size="sm">
          Los reportes se generan en formato PDF directamente desde el servidor
          y se descargan automáticamente. Selecciona el tipo de reporte,
          completa los parámetros requeridos y haz clic en Descargar reporte
          PDF. El proceso puede tardar unos segundos dependiendo del volumen de
          datos.
        </Text>
      </Alert>

      {/* Sección: Reportes individuales */}
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={4}>Reportes individuales</Title>
          <Text size="sm" c="dimmed">
            Informes enfocados en una provincia, ODS o actor cooperante
            específico.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {REPORTES_CONFIG.filter((r) => r.permiso === "reportes.generar").map(
            (reporte) => (
              <ReporteCard
                key={reporte.id}
                id={reporte.id}
                titulo={reporte.titulo}
                descripcion={reporte.descripcion}
                icono={reporte.icono}
                color={reporte.color}
                onGenerar={(params) => handleGenerar(reporte.id, params)}
                tienePermiso={puedeGenerar}
              />
            ),
          )}
        </SimpleGrid>

        {/* Sección: Reportes masivos */}
        <Stack gap="xs">
          <Title order={4}>Reportes consolidados</Title>
          <Text size="sm" c="dimmed">
            Documentos ejecutivos completos del CONGOPE. Requieren permiso
            especial de exportación masiva.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {REPORTES_CONFIG.filter(
            (r) => r.permiso === "reportes.exportar_masivo",
          ).map((reporte) => (
            <ReporteCard
              key={reporte.id}
              id={reporte.id}
              titulo={reporte.titulo}
              descripcion={reporte.descripcion}
              icono={reporte.icono}
              color={reporte.color}
              onGenerar={(params) => handleGenerar(reporte.id, params)}
              tienePermiso={puedeExportarMasivo}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </>
  );
}
