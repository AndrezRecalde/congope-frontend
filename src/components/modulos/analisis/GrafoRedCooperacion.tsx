'use client'

import {
  useState, useMemo, useCallback, useRef,
} from 'react';
import dynamic from 'next/dynamic';
import {
  Stack, Group, Text, Badge, Paper,
  Select, NumberInput, Button, Skeleton,
  Alert, Title, Drawer, Divider,
  ThemeIcon, SimpleGrid, ActionIcon,
  Tooltip, SegmentedControl,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconNetwork,
  IconRefresh,
  IconFilter,
  IconMapPin,
  IconBuildingBank,
  IconZoomIn,
  IconZoomOut,
  IconFocus2,
} from '@tabler/icons-react';
import { useRedCooperacion }
  from '@/queries/red-cooperacion.queries';
import type {
  NodoGrafo,
  AristaGrafo,
  FiltrosGrafo,
} from '@/types/red-cooperacion.types';
import {
  COLOR_TIPO_ACTOR,
  COLOR_PROVINCIA,
  COLOR_DEFAULT,
} from '@/types/red-cooperacion.types';

// ECharts solo en el cliente
const ReactECharts = dynamic(
  () => import('echarts-for-react'),
  { ssr: false }
);

// ── Formateo de montos ───────────────────────────

function formatearMonto(monto: number): string {
  if (monto === 0) return '$0 USD';
  if (monto >= 1_000_000)
    return `$${(monto / 1_000_000).toFixed(1)}M USD`;
  if (monto >= 1_000)
    return `$${(monto / 1_000).toFixed(1)}K USD`;
  return `$${monto.toLocaleString()} USD`;
}

// ── Panel de detalle de nodo ─────────────────────

function DetalleNodo({
  nodo,
  aristas,
  nodosMap,
  abierto,
  onCerrar,
}: {
  nodo:     NodoGrafo | null;
  aristas:  AristaGrafo[];
  nodosMap: Map<string, NodoGrafo>;
  abierto:  boolean;
  onCerrar: () => void;
}) {
  if (!nodo) return null;

  const esActor = nodo.tipo === 'actor';

  // Aristas conectadas a este nodo
  const aristasConectadas = aristas.filter(
    (a) => a.source === nodo.id ||
           a.target === nodo.id
  );

  // Nodos vecinos
  const vecinos = aristasConectadas.map((a) => {
    const vecinoId = a.source === nodo.id
      ? a.target : a.source;
    return {
      nodo:    nodosMap.get(vecinoId),
      arista:  a,
    };
  }).filter((v) => v.nodo !== undefined);

  const colorNodo = esActor
    ? (COLOR_TIPO_ACTOR[nodo.subtipo] ?? COLOR_DEFAULT)
    : COLOR_PROVINCIA;

  return (
    <Drawer
      opened={abierto}
      onClose={onCerrar}
      position="right"
      size={420}
      title={
        <Group gap="sm">
          <ThemeIcon
            size={36}
            radius="md"
            style={{
              background: colorNodo,
              color:      'white',
            }}
          >
            {esActor
              ? <IconBuildingBank size={18} />
              : <IconMapPin size={18} />
            }
          </ThemeIcon>
          <div>
            <Text fw={700} size="sm" lineClamp={1}>
              {nodo.nombre}
            </Text>
            <Badge
              size="xs"
              style={{
                background: colorNodo + '20',
                color:      colorNodo,
                border:     `1px solid ${colorNodo}40`,
              }}
            >
              {nodo.subtipo}
            </Badge>
          </div>
        </Group>
      }
    >
      <Stack gap="md" p="md">

        {/* KPIs del nodo */}
        <SimpleGrid cols={2} spacing="sm">
          <Paper
            p="md"
            radius="md"
            style={{
              background: colorNodo + '10',
              border:     `1px solid ${colorNodo}30`,
              textAlign:  'center',
            }}
          >
            <Text
              fw={900}
              size="xl"
              style={{ color: colorNodo }}
            >
              {nodo.valor}
            </Text>
            <Text size="xs" c="dimmed">
              {esActor ? 'Provincias' : 'Actores'}
              {' '}conectadas
            </Text>
          </Paper>
          <Paper
            p="md"
            radius="md"
            style={{
              background:
                'var(--mantine-color-gray-0)',
              border:
                '1px solid var(--mantine-color-gray-3)',
              textAlign: 'center',
            }}
          >
            <Text fw={900} size="sm">
              {formatearMonto(nodo.monto)}
            </Text>
            <Text size="xs" c="dimmed">
              Inversión total
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Info adicional */}
        {esActor && nodo.extra.pais_origen && (
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              País:
            </Text>
            <Text size="xs" fw={600}>
              {nodo.extra.pais_origen}
            </Text>
          </Group>
        )}

        {!esActor && nodo.extra.capital && (
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              Capital:
            </Text>
            <Text size="xs" fw={600}>
              {nodo.extra.capital}
            </Text>
          </Group>
        )}

        <Divider
          label={
            <Text size="xs" c="dimmed">
              Conexiones ({vecinos.length})
            </Text>
          }
        />

        {/* Lista de vecinos */}
        <Stack gap="xs">
          {vecinos.map(({ nodo: vecino, arista }) => {
            if (!vecino) return null;
            const colorVecino =
              vecino.tipo === 'actor'
                ? (COLOR_TIPO_ACTOR[vecino.subtipo]
                   ?? COLOR_DEFAULT)
                : COLOR_PROVINCIA;

            return (
              <Paper
                key={vecino.id}
                p="sm"
                radius="md"
                style={{
                  border:
                    '1px solid var(--mantine-color-gray-3)',
                }}
              >
                <Group
                  justify="space-between"
                  wrap="nowrap"
                >
                  <Group gap="xs" wrap="nowrap">
                    <div style={{
                      width:        10,
                      height:       10,
                      borderRadius: '50%',
                      background:   colorVecino,
                      flexShrink:   0,
                    }} />
                    <Text size="xs" fw={600}
                      lineClamp={1}>
                      {vecino.nombre}
                    </Text>
                  </Group>
                  <Group gap={6} wrap="nowrap">
                    <Badge size="xs" variant="light"
                      color="blue">
                      {arista.proyectos} proy.
                    </Badge>
                    <Text size="xs" c="dimmed"
                      style={{ whiteSpace: 'nowrap' }}>
                      {formatearMonto(arista.peso)}
                    </Text>
                  </Group>
                </Group>

                {/* Nombres de proyectos */}
                {arista.nombres_proyectos.length > 0 && (
                  <Text
                    size="xs"
                    c="dimmed"
                    mt={4}
                    lineClamp={2}
                  >
                    {arista.nombres_proyectos.join(
                      ' · '
                    )}
                    {arista.proyectos > 3
                      ? ` +${arista.proyectos - 3} más`
                      : ''}
                  </Text>
                )}
              </Paper>
            );
          })}
        </Stack>
      </Stack>
    </Drawer>
  );
}

// ── Componente principal ─────────────────────────

export function GrafoRedCooperacion() {
  const [filtros, setFiltros] =
    useState<Partial<FiltrosGrafo>>({});

  const [filtrosBorrador, setFiltrosBorrador] =
    useState<Partial<FiltrosGrafo>>({});

  const [nodoSeleccionado, setNodoSeleccionado] =
    useState<NodoGrafo | null>(null);

  const [drawerAbierto, {
    open:  abrirDrawer,
    close: cerrarDrawer,
  }] = useDisclosure(false);

  const echartsRef = useRef<unknown>(null);

  const { data, isLoading, isError, refetch } =
    useRedCooperacion(filtros);

  // Mapa de nodos para búsqueda rápida
  const nodosMap = useMemo(() => {
    if (!data) return new Map<string, NodoGrafo>();
    return new Map(data.nodos.map(
      (n) => [n.id, n]
    ));
  }, [data]);

  // ── Construir opción ECharts ─────────────────

  const option = useMemo(() => {
    if (!data) return {};

    const { nodos, aristas, meta } = data;

    // Normalizar tamaños de nodos
    const minTam = 16;
    const maxTam = 48;
    const escalarTam = (valor: number) => {
      if (meta.max_grado === 0) return minTam;
      const ratio = valor / meta.max_grado;
      return minTam + ratio * (maxTam - minTam);
    };

    // Normalizar grosor de aristas
    const escalarGrosor = (proyectos: number) =>
      Math.min(1 + proyectos * 0.8, 6);

    // Nodos para ECharts
    const nodosSerie = nodos.map((nodo) => {
      const esActor = nodo.tipo === 'actor';
      const color   = esActor
        ? (COLOR_TIPO_ACTOR[nodo.subtipo]
           ?? COLOR_DEFAULT)
        : COLOR_PROVINCIA;
      const tam = escalarTam(nodo.valor);

      return {
        id:         nodo.id,
        name:       nodo.nombre,
        value:      nodo.valor,
        symbolSize: tam,
        symbol:     esActor ? 'circle' : 'roundRect',
        itemStyle: {
          color,
          borderColor: 'white',
          borderWidth: 2,
          shadowBlur:  esActor ? 6 : 4,
          shadowColor: color + '40',
        },
        label: {
          show:       tam > 24,
          position:   'bottom',
          fontSize:   9,
          color:      '#0B1F3A',
          fontFamily: 'DM Sans',
          fontWeight: 600,
          formatter:  (p: { name: string }) =>
            p.name.length > 12
              ? p.name.slice(0, 11) + '…'
              : p.name,
        },
        // Datos extra para el tooltip y el drawer
        _tipo:    nodo.tipo,
        _subtipo: nodo.subtipo,
        _monto:   nodo.monto,
        _extra:   nodo.extra,
      };
    });

    // Aristas para ECharts
    const aristasSerie = aristas.map((arista) => ({
      id:     arista.id,
      source: arista.source,
      target: arista.target,
      value:  arista.proyectos,
      lineStyle: {
        width:     escalarGrosor(arista.proyectos),
        color:     'rgba(11,31,58,0.18)',
        curveness: 0.08,
      },
      emphasis: {
        lineStyle: {
          color: 'rgba(11,31,58,0.5)',
          width: escalarGrosor(arista.proyectos) + 1,
        },
      },
      // Datos para tooltip
      _peso:              arista.peso,
      _proyectos:         arista.proyectos,
      _nombres_proyectos: arista.nombres_proyectos,
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger:   'item',
        formatter: (params: {
          dataType: string;
          data: {
            name:               string;
            _tipo?:             string;
            _subtipo?:          string;
            _monto?:            number;
            _extra?:            Record<string, string>;
            _peso?:             number;
            _proyectos?:        number;
            _nombres_proyectos?:string[];
            source?:            string;
            target?:            string;
          };
        }) => {
          const { dataType, data } = params;

          if (dataType === 'node') {
            const esActor = data._tipo === 'actor';
            const color   = esActor
              ? (COLOR_TIPO_ACTOR[data._subtipo ?? '']
                 ?? COLOR_DEFAULT)
              : COLOR_PROVINCIA;
            return (
              `<div style="font-family:DM Sans;` +
              `font-size:12px;min-width:160px">` +
              `<div style="font-weight:700;` +
              `color:${color};margin-bottom:4px">` +
              `${data.name}</div>` +
              `<div style="color:rgba(255,255,255,0.7)">` +
              `${data._subtipo}</div>` +
              (data._extra?.pais_origen
                ? `<div style="color:rgba(255,255,255,0.6)` +
                  `;font-size:11px">` +
                  `${data._extra.pais_origen}</div>`
                : '') +
              (data._extra?.capital
                ? `<div style="color:rgba(255,255,255,0.6)` +
                  `;font-size:11px">` +
                  `Capital: ${data._extra.capital}</div>`
                : '') +
              `<div style="margin-top:6px;` +
              `padding-top:6px;` +
              `border-top:1px solid rgba(255,255,255,0.1)">` +
              `<span style="color:white;font-weight:700">` +
              `${formatearMonto(data._monto ?? 0)}</span>` +
              `<span style="color:rgba(255,255,255,0.5)` +
              `;font-size:11px"> en cooperación</span>` +
              `</div>` +
              `<div style="color:rgba(255,255,255,0.5)` +
              `;font-size:11px;margin-top:2px">` +
              `Haz clic para ver detalle</div>` +
              `</div>`
            );
          }

          if (dataType === 'edge') {
            const nombres = data._nombres_proyectos
              ?? [];
            return (
              `<div style="font-family:DM Sans;` +
              `font-size:12px;min-width:180px">` +
              `<div style="font-weight:700;` +
              `color:white;margin-bottom:4px">` +
              `${data._proyectos} proyecto` +
              `${(data._proyectos ?? 0) !== 1
                ? 's' : ''}</div>` +
              `<div style="color:rgba(255,255,255,0.7)` +
              `;font-size:11px;margin-bottom:4px">` +
              `${formatearMonto(data._peso ?? 0)}` +
              `</div>` +
              (nombres.length > 0
                ? `<div style="color:rgba(255,255,255,0.5)` +
                  `;font-size:10px">` +
                  nombres.join('<br>') +
                  ((data._proyectos ?? 0) > 3
                    ? `<br>+${
                        (data._proyectos ?? 0) - 3
                      } más`
                    : '') +
                  `</div>`
                : '') +
              `</div>`
            );
          }

          return '';
        },
        backgroundColor: 'rgba(11,31,58,0.92)',
        borderColor:     'rgba(201,168,76,0.3)',
        textStyle:       { color: 'white' },
      },

      legend: [
        {
          data: [
            { name: 'Provincia',
              icon: 'roundRect',
              itemStyle: {
                color: COLOR_PROVINCIA,
              },
            },
            ...Object.entries(COLOR_TIPO_ACTOR)
              .map(([tipo, color]) => ({
                name:      tipo,
                icon:      'circle',
                itemStyle: { color },
              })),
          ],
          orient:    'vertical',
          right:     8,
          top:       'center',
          textStyle: {
            fontSize:   10,
            color:      '#4A5568',
            fontFamily: 'DM Sans',
          },
          itemWidth:  12,
          itemHeight: 12,
        },
      ],

      series: [{
        type:               'graph',
        layout:             'force',
        animation:          true,
        animationDuration:  1500,
        animationEasing:    'cubicOut',
        roam:               true,
        draggable:          true,
        data:               nodosSerie,
        links:              aristasSerie,
        categories: [
          { name: 'Provincia' },
          ...Object.keys(COLOR_TIPO_ACTOR).map(
            (tipo) => ({ name: tipo })
          ),
        ],
        force: {
          repulsion:   350,
          gravity:     0.12,
          edgeLength:  [80, 220],
          friction:    0.65,
          layoutAnimation: true,
        },
        emphasis: {
          focus:        'adjacency',
          blurScope:    'global',
          lineStyle: {
            color: 'rgba(11,31,58,0.6)',
          },
        },
        lineStyle: {
          opacity: 0.7,
        },
        label: {
          show: true,
        },
      }],
    };
  }, [data]);

  // ── Handler de clic en nodo ──────────────────

  const handleClick = useCallback(
    (params: {
      dataType: string;
      data: { id: string };
    }) => {
      if (params.dataType !== 'node') return;
      const nodo = nodosMap.get(params.data.id);
      if (!nodo) return;
      setNodoSeleccionado(nodo);
      abrirDrawer();
    },
    [nodosMap, abrirDrawer]
  );

  // ── Aplicar filtros ──────────────────────────

  const aplicarFiltros = () => {
    setFiltros(filtrosBorrador);
  };

  const limpiarFiltros = () => {
    setFiltrosBorrador({});
    setFiltros({});
  };

  // ── Estados ──────────────────────────────────

  if (isLoading) {
    return (
      <Paper p="xl" radius="xl"
        style={{
          border:
            '1px solid var(--mantine-color-gray-3)',
        }}
      >
        <Stack gap="md">
          <Skeleton height={28} width="50%" />
          <Skeleton height={600} radius="md" />
        </Stack>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        color="red"
        title="Error al cargar la red de cooperación"
        radius="md"
      >
        No se pudo obtener los datos del grafo.
        Intenta recargar la página.
      </Alert>
    );
  }

  const sinDatos = !data ||
    data.nodos.length === 0;

  // ── Render ───────────────────────────────────

  return (
    <>
      <Paper
        p="xl"
        radius="xl"
        style={{
          border:
            '1px solid var(--mantine-color-gray-3)',
        }}
      >
        <Stack gap="lg">

          {/* Cabecera */}
          <Group
            justify="space-between"
            align="flex-start"
            wrap="wrap"
            gap="sm"
          >
            <div>
              <Group gap="xs" mb={4}>
                <Title order={4}>
                  Red de Cooperación
                </Title>
                {data && (
                  <Badge variant="light" color="blue">
                    {data.meta.total_actores} actores ·{' '}
                    {data.meta.total_provincias} provincias
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed">
                Relaciones entre actores cooperantes
                y provincias. Nodos más grandes = más
                conexiones. Haz clic para ver detalles.
              </Text>
            </div>

            <Tooltip label="Recargar datos">
              <ActionIcon
                variant="light"
                color="gray"
                onClick={() => refetch()}
              >
                <IconRefresh size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* KPIs de la red */}
          {data && (
            <SimpleGrid
              cols={{ base: 2, sm: 4 }}
              spacing="sm"
            >
              {[
                {
                  valor:    data.meta.total_proyectos,
                  etiqueta: 'Proyectos',
                  color:    'blue',
                },
                {
                  valor:    data.meta.total_actores,
                  etiqueta: 'Actores',
                  color:    'indigo',
                },
                {
                  valor:    data.meta.total_provincias,
                  etiqueta: 'Provincias',
                  color:    'yellow',
                },
                {
                  valor:    data.meta.monto_formateado,
                  etiqueta: 'Cooperación',
                  color:    'green',
                },
              ].map((kpi) => (
                <Paper
                  key={kpi.etiqueta}
                  p="md"
                  radius="lg"
                  style={{
                    border: '1px solid ' +
                      `var(--mantine-color-${
                        kpi.color
                      }-2)`,
                    background: `var(--mantine-color-${
                      kpi.color
                    }-0)`,
                    textAlign: 'center',
                  }}
                >
                  <Text
                    fw={800}
                    size="lg"
                    c={`${kpi.color}.7`}
                  >
                    {kpi.valor}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {kpi.etiqueta}
                  </Text>
                </Paper>
              ))}
            </SimpleGrid>
          )}

          {/* Panel de filtros */}
          <Paper
            p="md"
            radius="lg"
            style={{
              background:
                'var(--mantine-color-gray-0)',
              border:
                '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <Group gap="sm" align="flex-end"
              wrap="wrap">
              <Select
                label="Estado del proyecto"
                placeholder="Todos"
                size="xs"
                w={160}
                clearable
                data={[
                  { value: 'En gestión',
                    label:  'En gestión' },
                  { value: 'En ejecución',
                    label:  'En ejecución' },
                  { value: 'Finalizado',
                    label:  'Finalizado' },
                  { value: 'Suspendido',
                    label:  'Suspendido' },
                ]}
                value={
                  filtrosBorrador.estado ?? null
                }
                onChange={(v) =>
                  setFiltrosBorrador({
                    ...filtrosBorrador,
                    estado: v ?? '',
                  })
                }
              />
              <Select
                label="Tipo de actor"
                placeholder="Todos"
                size="xs"
                w={160}
                clearable
                data={[
                  'Multilateral', 'Bilateral',
                  'ONG', 'Privado', 'Academia',
                  'Gobierno', 'Internacional',
                ].map((t) => ({
                  value: t, label: t,
                }))}
                value={
                  filtrosBorrador.tipo_actor ?? null
                }
                onChange={(v) =>
                  setFiltrosBorrador({
                    ...filtrosBorrador,
                    tipo_actor: v ?? '',
                  })
                }
              />
              <NumberInput
                label="Mín. proyectos por arista"
                placeholder="1"
                size="xs"
                w={180}
                min={1}
                max={20}
                value={
                  filtrosBorrador.min_proyectos
                    ? parseInt(
                        filtrosBorrador.min_proyectos
                      )
                    : undefined
                }
                onChange={(v) =>
                  setFiltrosBorrador({
                    ...filtrosBorrador,
                    min_proyectos: v
                      ? String(v)
                      : '',
                  })
                }
              />
              <Group gap="xs">
                <Button
                  size="xs"
                  leftSection={<IconFilter size={13} />}
                  onClick={aplicarFiltros}
                >
                  Aplicar
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={limpiarFiltros}
                >
                  Limpiar
                </Button>
              </Group>
            </Group>
          </Paper>

          {/* Grafo o estado vacío */}
          {sinDatos ? (
            <Stack align="center" py="xl" gap="md">
              <ThemeIcon
                size={64}
                radius="xl"
                color="gray"
                variant="light"
              >
                <IconNetwork size={32} />
              </ThemeIcon>
              <Text fw={600} c="gray.6">
                Sin datos para el grafo
              </Text>
              <Text size="sm" c="dimmed"
                ta="center" maw={360}>
                No hay proyectos con actores
                y provincias asignados, o los
                filtros aplicados son demasiado
                restrictivos.
              </Text>
              {Object.keys(filtros).length > 0 && (
                <Button
                  variant="light"
                  size="sm"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </Button>
              )}
            </Stack>
          ) : (
            <>
              {/* Instrucciones de uso */}
              <Text size="xs" c="dimmed" ta="center">
                🖱️ Arrastra nodos · Rueda del ratón
                para zoom · Clic en un nodo para
                ver detalles · Hover en aristas
                para ver proyectos
              </Text>

              {/* El grafo */}
              <div style={{
                height:       620,
                borderRadius: 12,
                overflow:     'hidden',
                border:
                  '1px solid var(--mantine-color-gray-3)',
                background:   '#FAFAFA',
              }}>
                <ReactECharts
                  option={option}
                  style={{
                    width:  '100%',
                    height: '100%',
                  }}
                  opts={{ renderer: 'canvas' }}
                  onEvents={{
                    click: handleClick,
                  }}
                />
              </div>
            </>
          )}
        </Stack>
      </Paper>

      {/* Drawer de detalle del nodo */}
      <DetalleNodo
        nodo={nodoSeleccionado}
        aristas={data?.aristas ?? []}
        nodosMap={nodosMap}
        abierto={drawerAbierto}
        onCerrar={cerrarDrawer}
      />
    </>
  );
}
