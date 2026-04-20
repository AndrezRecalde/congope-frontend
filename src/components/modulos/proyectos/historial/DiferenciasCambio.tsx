"use client";

import { Stack, Text, Group, Code } from "@mantine/core";

// Campos que NO se muestran al usuario
// (son metadatos técnicos sin valor para el lector)
const CAMPOS_IGNORADOS = [
  "updated_at",
  "created_at",
  "deleted_at",
  "id",
  "created_by",
  "updated_by",
];

// Etiquetas amigables para los campos más comunes
const ETIQUETA_CAMPO: Record<string, string> = {
  nombre: "Nombre",
  estado: "Estado",
  monto_total: "Monto total",
  fecha_inicio: "Fecha inicio",
  fecha_fin_planificada: "Fecha fin planificada",
  fecha_fin_real: "Fecha fin real",
  sector_tematico: "Sector temático",
  flujo_direccion: "Flujo de cooperación",
  modalidad_cooperacion: "Modalidad",
  descripcion: "Descripción",
  completado: "Completado",
  titulo: "Título",
  fecha_limite: "Fecha límite",
  es_publico: "Publicado",
  periodo: "Período",
  descripcion_impacto: "Descripción del impacto",
};

function formatearValor(valor: unknown): string {
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "string" && valor.length > 120) {
    return valor.slice(0, 120) + "...";
  }
  if (Array.isArray(valor)) return valor.join(", ");
  return String(valor);
}

interface DiferenciasCambioProps {
  accion: string;
  valoresAnteriores: Record<string, unknown> | null;
  valoresNuevos: Record<string, unknown> | null;
}

export function DiferenciasCambio({
  accion,
  valoresAnteriores,
  valoresNuevos,
}: DiferenciasCambioProps) {
  // Sin datos que mostrar
  if (!valoresAnteriores && !valoresNuevos) {
    return (
      <Text size="xs" c="dimmed" fs="italic">
        Sin detalles disponibles
      </Text>
    );
  }

  // ── ACCIÓN CREAR — mostrar valores nuevos ──
  if (accion === "crear" && valoresNuevos) {
    const campos = Object.entries(valoresNuevos)
      .filter(([clave]) => !CAMPOS_IGNORADOS.includes(clave))
      .slice(0, 6); // Limitar para no abrumar

    if (campos.length === 0) {
      return (
        <Text size="xs" c="dimmed">
          Registro creado
        </Text>
      );
    }

    return (
      <Stack gap={4}>
        {campos.map(([clave, valor]) => (
          <Group key={clave} gap="xs" wrap="nowrap" align="flex-start">
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              style={{ minWidth: 140, flexShrink: 0 }}
            >
              {ETIQUETA_CAMPO[clave] ?? clave}:
            </Text>
            <Code
              fz="xs"
              //color="green"
              style={{
                maxWidth: 300,
                wordBreak: "break-all",
              }}
            >
              {formatearValor(valor)}
            </Code>
          </Group>
        ))}
      </Stack>
    );
  }

  // ── ACCIÓN EDITAR — mostrar diferencias ──
  if (accion === "editar" && valoresNuevos) {
    // Los campos que cambiaron están en valoresNuevos
    // Los valores anteriores están en valoresAnteriores
    const camposCambiados = Object.entries(valoresNuevos).filter(
      ([clave]) => !CAMPOS_IGNORADOS.includes(clave),
    );

    if (camposCambiados.length === 0) {
      return (
        <Text size="xs" c="dimmed">
          Sin cambios visibles en los datos
        </Text>
      );
    }

    return (
      <Stack gap={6}>
        {camposCambiados.map(([clave, nuevoValor]) => {
          const valorAnterior = valoresAnteriores?.[clave];

          return (
            <div key={clave}>
              <Text size="xs" fw={600} c="dimmed" mb={3}>
                {ETIQUETA_CAMPO[clave] ?? clave}
              </Text>
              <Group gap="xs" wrap="nowrap" align="flex-start">
                {/* Valor anterior */}
                {valorAnterior !== undefined && (
                  <Code
                    fz="xs"
                    color="red"
                    style={{
                      maxWidth: 200,
                      wordBreak: "break-all",
                      textDecoration: "line-through",
                      opacity: 0.8,
                    }}
                  >
                    {formatearValor(valorAnterior)}
                  </Code>
                )}
                {/* Flecha */}
                {valorAnterior !== undefined && (
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                    →
                  </Text>
                )}
                {/* Valor nuevo */}
                <Code
                  fz="xs"
                  color="green"
                  style={{
                    maxWidth: 200,
                    wordBreak: "break-all",
                  }}
                >
                  {formatearValor(nuevoValor)}
                </Code>
              </Group>
            </div>
          );
        })}
      </Stack>
    );
  }

  // ── ACCIÓN ELIMINAR — mostrar lo que existía ──
  if (accion === "eliminar" && valoresAnteriores) {
    const campos = Object.entries(valoresAnteriores)
      .filter(([clave]) => !CAMPOS_IGNORADOS.includes(clave))
      .slice(0, 4);

    return (
      <Stack gap={4}>
        {campos.map(([clave, valor]) => (
          <Group key={clave} gap="xs" wrap="nowrap">
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              style={{ minWidth: 140, flexShrink: 0 }}
            >
              {ETIQUETA_CAMPO[clave] ?? clave}:
            </Text>
            <Code fz="xs" color="red" style={{ wordBreak: "break-all" }}>
              {formatearValor(valor)}
            </Code>
          </Group>
        ))}
      </Stack>
    );
  }

  return (
    <Text size="xs" c="dimmed">
      Sin detalles para mostrar
    </Text>
  );
}
