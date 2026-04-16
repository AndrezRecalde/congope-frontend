"use client";

import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
  Switch,
  Table,
  Badge,
  Text,
  ActionIcon,
  Paper,
  Divider,
  Select,
} from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useConfirm } from "@/hooks/useConfirm";
import {
  useCategoriasLista,
  useCrearCategoria,
  useActualizarCategoria,
  useEliminarCategoria,
} from "@/queries/categorias-beneficiario.queries";
import type { CategoriaBeneficiario } from "@/services/axios";

// ── Grupos predefinidos ────────────────────────────────────
const GRUPOS = [
  { value: "Enfoque Social y Prioritario", label: "Enfoque Social y Prioritario" },
  { value: "Pueblos y Nacionalidades",     label: "Pueblos y Nacionalidades" },
  { value: "Sector Productivo",            label: "Sector Productivo" },
  { value: "Sociedad Civil",               label: "Sociedad Civil" },
  { value: "Institucional",                label: "Institucional" },
];

// ── Formulario en Modal ────────────────────────────────────
interface CategoriaFormProps {
  categoria?: CategoriaBeneficiario;
  onClose: () => void;
}

function CategoriaForm({ categoria, onClose }: CategoriaFormProps) {
  const esEdicion = !!categoria;
  const { mutate: crear, isPending: creando } = useCrearCategoria();
  const { mutate: actualizar, isPending: actualizando } = useActualizarCategoria();

  const form = useForm({
    initialValues: {
      nombre: categoria?.nombre ?? "",
      grupo:  categoria?.grupo  ?? "",
      activo: categoria?.activo ?? true,
    },
    validate: {
      nombre: isNotEmpty("El nombre es obligatorio"),
      grupo:  isNotEmpty("El grupo es obligatorio"),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    if (esEdicion) {
      actualizar(
        { id: categoria.id, data: values },
        { onSuccess: onClose },
      );
    } else {
      crear(values, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="md">
        <TextInput
          label="Nombre"
          placeholder="Ej: Mujeres"
          required
          {...form.getInputProps("nombre")}
        />
        <Select
          label="Grupo"
          placeholder="Seleccionar grupo"
          data={GRUPOS}
          required
          searchable
          {...form.getInputProps("grupo")}
        />
        <Switch
          label="Categoría activa"
          description="Las categorías inactivas no aparecen en el formulario de proyectos"
          {...form.getInputProps("activo", { type: "checkbox" })}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            color="congope"
            loading={creando || actualizando}
          >
            {esEdicion ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// ── Página Principal ───────────────────────────────────────
export default function CategoriasBeneficiarioPage() {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<
    CategoriaBeneficiario | undefined
  >(undefined);

  const { data: categorias = [], isLoading } = useCategoriasLista({ search: busqueda });
  const { mutate: eliminar } = useEliminarCategoria();
  const { confirmar } = useConfirm();

  const abrirCrear = () => {
    setCategoriaEditando(undefined);
    setModalAbierto(true);
  };

  const abrirEditar = (cat: CategoriaBeneficiario) => {
    setCategoriaEditando(cat);
    setModalAbierto(true);
  };

  const confirmarEliminar = (cat: CategoriaBeneficiario) => {
    confirmar({
      titulo:      "Eliminar categoría",
      mensaje:     `¿Estás seguro de eliminar "${cat.nombre}"? No se puede eliminar si está en uso por proyectos.`,
      textoBoton:  "Eliminar",
      colorBoton:  "red",
      onConfirmar: () => eliminar(cat.id),
    });
  };

  // Agrupar por grupo para la vista de tabla
  const porGrupo = categorias.reduce<Record<string, CategoriaBeneficiario[]>>(
    (acc, cat) => {
      if (!acc[cat.grupo]) acc[cat.grupo] = [];
      acc[cat.grupo].push(cat);
      return acc;
    },
    {},
  );

  return (
    <>
      <PageHeader
        titulo="Categorías de Beneficiarios"
        descripcion="Catálogo de grupos y categorías de beneficiarios para registrar en proyectos de cooperación"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Configuración", href: "/configuracion" },
          { label: "Beneficiarios" },
        ]}
        acciones={
          <Button
            color="congope"
            leftSection={<IconPlus size={16} />}
            onClick={abrirCrear}
          >
            Nueva categoría
          </Button>
        }
      />

      {/* Búsqueda */}
      <Paper p="md" radius="md" mb="md" style={{ border: "1px solid var(--mantine-color-gray-3)" }}>
        <TextInput
          placeholder="Buscar categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </Paper>

      {/* Contenido */}
      {!isLoading && categorias.length === 0 ? (
        <EmptyState
          icono={<IconUsers size={36} />}
          titulo="No hay categorías registradas"
          descripcion="Crea la primera categoría de beneficiarios."
          accion={
            <Button
              color="congope"
              leftSection={<IconPlus size={16} />}
              onClick={abrirCrear}
            >
              Crear primera categoría
            </Button>
          }
        />
      ) : (
        <Stack gap="lg">
          {Object.entries(porGrupo).map(([grupo, items]) => (
            <Paper
              key={grupo}
              p="md"
              radius="md"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Group mb="sm" gap="sm">
                <Badge variant="light" color="congope" size="lg">
                  {grupo}
                </Badge>
                <Text size="xs" c="dimmed">
                  {items.length} categoría{items.length !== 1 ? "s" : ""}
                </Text>
              </Group>
              <Divider mb="sm" />
              <Table striped highlightOnHover withTableBorder={false}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th style={{ width: 100 }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((cat) => (
                    <Table.Tr key={cat.id}>
                      <Table.Td>
                        <Text size="sm">{cat.nombre}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="light"
                          color={cat.activo ? "green" : "gray"}
                        >
                          {cat.activo ? "Activa" : "Inactiva"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            title="Editar"
                            onClick={() => abrirEditar(cat)}
                          >
                            <IconPencil size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            title="Eliminar"
                            onClick={() => confirmarEliminar(cat)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Modal crear/editar */}
      <Modal
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={
          categoriaEditando ? "Editar categoría" : "Nueva categoría de beneficiario"
        }
        size="md"
      >
        <CategoriaForm
          categoria={categoriaEditando}
          onClose={() => setModalAbierto(false)}
        />
      </Modal>
    </>
  );
}
