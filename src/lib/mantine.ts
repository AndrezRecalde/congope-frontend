/**
 * CONGOPE — Tema Mantine 8.x
 * Estilo: Clean & Professional
 * Tipografía: Inter (exclusiva)
 *
 * Este archivo define el sistema visual completo.
 * NO modificar colores ni tipografía sin aprobación.
 */

import { createTheme, rem, type MantineThemeOverride } from "@mantine/core";

export const themeCongope: MantineThemeOverride = createTheme({
  // ─────────────────────────────────────────────────────
  // TIPOGRAFÍA — Inter exclusivamente
  // ─────────────────────────────────────────────────────
  // La fuente Inter se carga en el root layout con next/font/google.
  // La variable CSS --font-inter se pasa a fontFamily aquí.
  fontFamily:
    "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace:
    "JetBrains Mono, Fira Code, Monaco, Courier New, monospace",

  fontSizes: {
    xs: rem(11),
    sm: rem(13),
    md: rem(14),
    lg: rem(16),
    xl: rem(20),
  },

  lineHeights: {
    xs: "1.4",
    sm: "1.45",
    md: "1.5",
    lg: "1.6",
    xl: "1.65",
  },

  // ─────────────────────────────────────────────────────
  // COLORES
  // ─────────────────────────────────────────────────────
  primaryColor: "congope",
  primaryShade: { light: 8, dark: 6 },

  colors: {
    // Azul institucional CONGOPE
    congope: [
      "#EFF6FF", // 0 — fondos muy suaves
      "#DBEAFE", // 1 — hover/active backgrounds
      "#BFDBFE", // 2 — borders suaves
      "#93C5FD", // 3
      "#60A5FA", // 4
      "#3B82F6", // 5
      "#2E6DA4", // 6 — azul secundario CONGOPE
      "#1D4ED8", // 7 — botones hover
      "#1A3A5C", // 8 — PRIMARIO INSTITUCIONAL ✓
      "#0F2444", // 9 — máxima saturación
    ],

    // Dorado institucional CONGOPE
    acento: [
      "#FFFBEB", // 0
      "#FEF3C7", // 1
      "#FDE68A", // 2
      "#FCD34D", // 3
      "#FBBF24", // 4
      "#E8A020", // 5 — ACENTO PRINCIPAL ✓
      "#D97706", // 6
      "#B45309", // 7
      "#92400E", // 8
      "#78350F", // 9
    ],

    // Grises neutros (sistema base)
    gray: [
      "#FAFAFA", // 0 — gray-25 / fondo de página
      "#F9FAFB", // 1 — gray-50 / fondos de cards
      "#F3F4F6", // 2 — gray-100 / inputs deshabilitados
      "#E5E7EB", // 3 — gray-200 / borders generales
      "#D1D5DB", // 4 — gray-300 / borders de inputs
      "#9CA3AF", // 5 — gray-400 / placeholders
      "#6B7280", // 6 — gray-500 / texto secundario
      "#4B5563", // 7 — gray-600 / texto de soporte
      "#374151", // 8 — gray-700 / texto cuerpo
      "#1F2937", // 9 — gray-800 / texto principal
    ],

    // Estados semánticos
    green: [
      "#F0FDF4",
      "#DCFCE7",
      "#BBF7D0",
      "#86EFAC",
      "#4ADE80",
      "#22C55E",
      "#059669", // 6 — success principal
      "#047857",
      "#065F46",
      "#064E3B",
    ],

    red: [
      "#FEF2F2",
      "#FEE2E2",
      "#FECACA",
      "#FCA5A5",
      "#F87171",
      "#EF4444",
      "#DC2626", // 6 — error principal
      "#B91C1C",
      "#991B1B",
      "#7F1D1D",
    ],

    yellow: [
      "#FFFBEB",
      "#FEF3C7",
      "#FDE68A",
      "#FCD34D",
      "#FBBF24",
      "#F59E0B",
      "#D97706", // 6 — warning principal
      "#B45309",
      "#92400E",
      "#78350F",
    ],

    blue: [
      "#EFF6FF",
      "#DBEAFE",
      "#BFDBFE",
      "#93C5FD",
      "#60A5FA",
      "#3B82F6",
      "#2563EB", // 6 — info principal
      "#1D4ED8",
      "#1E40AF",
      "#1E3A8A",
    ],

    teal: [
      "#F0FDFA",
      "#CCFBF1",
      "#99F6E4",
      "#5EEAD4",
      "#2DD4BF",
      "#14B8A6",
      "#0D9488", // 6
      "#0F766E",
      "#115E59",
      "#134E4A",
    ],
  },

  // ─────────────────────────────────────────────────────
  // RADIOS DE BORDE
  // ─────────────────────────────────────────────────────
  defaultRadius: "md",

  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },

  // ─────────────────────────────────────────────────────
  // ESPACIADO
  // ─────────────────────────────────────────────────────
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },

  // ─────────────────────────────────────────────────────
  // BREAKPOINTS
  // ─────────────────────────────────────────────────────
  breakpoints: {
    xs: "36em", // 576px
    sm: "48em", // 768px
    md: "62em", // 992px
    lg: "75em", // 1200px
    xl: "88em", // 1408px
  },

  // ─────────────────────────────────────────────────────
  // SOMBRAS
  // ─────────────────────────────────────────────────────
  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px rgba(0, 0, 0, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04)",
    md: "0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.04)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.07), 0 8px 10px rgba(0, 0, 0, 0.04)",
  },

  // ─────────────────────────────────────────────────────
  // HEADINGS
  // ─────────────────────────────────────────────────────
  headings: {
    fontFamily: "var(--font-inter), Inter, sans-serif",
    fontWeight: "600",
    sizes: {
      h1: { fontSize: rem(32), fontWeight: "700", lineHeight: "1.2" },
      h2: { fontSize: rem(24), fontWeight: "600", lineHeight: "1.3" },
      h3: { fontSize: rem(20), fontWeight: "600", lineHeight: "1.4" },
      h4: { fontSize: rem(16), fontWeight: "600", lineHeight: "1.5" },
      h5: { fontSize: rem(14), fontWeight: "600", lineHeight: "1.5" },
      h6: { fontSize: rem(13), fontWeight: "600", lineHeight: "1.5" },
    },
  },

  // ─────────────────────────────────────────────────────
  // DEFAULTS DE COMPONENTES
  // Clean & Professional: precisión en cada detalle
  // ─────────────────────────────────────────────────────
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 500,
          letterSpacing: "0.01em",
        },
      },
    },

    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
        padding: "lg",
      },
      styles: {
        root: {
          border: "1px solid var(--mantine-color-gray-3)",
          transition: "box-shadow 200ms ease, border-color 200ms ease",
          "&:hover": {
            boxShadow: "var(--mantine-shadow-md)",
          },
        },
      },
    },

    Paper: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
      },
      styles: {
        root: {
          border: "1px solid var(--mantine-color-gray-3)",
        },
      },
    },

    TextInput: {
      defaultProps: { radius: "md" },
      styles: {
        label: {
          fontSize: rem(13),
          fontWeight: 500,
          marginBottom: rem(4),
        },
        input: {
          fontSize: rem(14),
          "&::placeholder": {
            color: "var(--mantine-color-gray-5)",
          },
        },
        description: {
          fontSize: rem(12),
          color: "var(--mantine-color-gray-6)",
        },
        error: {
          fontSize: rem(12),
        },
      },
    },

    PasswordInput: {
      defaultProps: { radius: "md" },
      styles: {
        label: {
          fontSize: rem(13),
          fontWeight: 500,
          marginBottom: rem(4),
        },
      },
    },

    Select: {
      defaultProps: { radius: "md" },
      styles: {
        label: {
          fontSize: rem(13),
          fontWeight: 500,
          marginBottom: rem(4),
        },
        option: {
          fontSize: rem(14),
        },
      },
    },

    MultiSelect: {
      defaultProps: { radius: "md" },
      styles: {
        label: {
          fontSize: rem(13),
          fontWeight: 500,
          marginBottom: rem(4),
        },
      },
    },

    Textarea: {
      defaultProps: { radius: "md" },
      styles: {
        label: {
          fontSize: rem(13),
          fontWeight: 500,
          marginBottom: rem(4),
        },
      },
    },

    DateInput: {
      defaultProps: { radius: "md" },
      styles: {
        label: {
          fontSize: rem(13),
          fontWeight: 500,
          marginBottom: rem(4),
        },
      },
    },

    NumberInput: {
      defaultProps: { radius: "md" },
      styles: {
        label: {
          fontSize: rem(13),
          fontWeight: 500,
          marginBottom: rem(4),
        },
      },
    },

    Badge: {
      defaultProps: {
        radius: "sm",
        variant: "light",
        size: "sm",
      },
      styles: {
        root: {
          fontWeight: 600,
          fontSize: rem(11),
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        },
      },
    },

    Modal: {
      defaultProps: {
        radius: "lg",
        centered: true,
        overlayProps: { blur: 3, opacity: 0.4 },
      },
      styles: {
        header: {
          borderBottom: "1px solid var(--mantine-color-gray-3)",
          paddingBottom: rem(12),
          marginBottom: rem(4),
        },
        title: {
          fontSize: rem(16),
          fontWeight: 600,
        },
        body: {
          paddingTop: rem(16),
        },
      },
    },

    Drawer: {
      styles: {
        header: {
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        },
        title: {
          fontSize: rem(16),
          fontWeight: 600,
        },
      },
    },

    Notification: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          boxShadow: "var(--mantine-shadow-lg)",
          border: "1px solid var(--mantine-color-gray-3)",
        },
        title: {
          fontSize: rem(14),
          fontWeight: 600,
        },
        description: {
          fontSize: rem(13),
        },
      },
    },

    ActionIcon: {
      defaultProps: {
        radius: "md",
        variant: "subtle",
      },
    },

    Tabs: {
      defaultProps: { radius: "md" },
      styles: {
        tab: {
          fontSize: rem(14),
          fontWeight: 500,
        },
      },
    },

    NavLink: {
      styles: {
        root: {
          borderRadius: rem(8),
          fontSize: rem(14),
          fontWeight: 500,
        },
        label: {
          fontSize: rem(14),
        },
      },
    },

    Table: {
      styles: {
        th: {
          fontSize: rem(11),
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          backgroundColor: "var(--mantine-color-gray-1)",
        },
        td: {
          fontSize: rem(14),
        },
      },
    },

    Tooltip: {
      defaultProps: {
        radius: "md",
        withArrow: true,
        transitionProps: { duration: 150 },
      },
      styles: {
        tooltip: {
          fontSize: rem(12),
          fontWeight: 500,
        },
      },
    },

    Menu: {
      styles: {
        dropdown: {
          border: "1px solid var(--mantine-color-gray-3)",
          boxShadow: "var(--mantine-shadow-md)",
        },
        item: {
          fontSize: rem(14),
          borderRadius: rem(6),
        },
        label: {
          fontSize: rem(11),
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--mantine-color-gray-5)",
        },
        divider: {
          borderColor: "var(--mantine-color-gray-3)",
        },
      },
    },

    Divider: {
      styles: {
        root: {
          borderColor: "var(--mantine-color-gray-3)",
        },
      },
    },

    Skeleton: {
      defaultProps: {
        radius: "md",
        animate: true,
      },
    },

    Alert: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        title: {
          fontSize: rem(14),
          fontWeight: 600,
        },
        message: {
          fontSize: rem(13),
        },
      },
    },

    Breadcrumbs: {
      styles: {
        root: {
          fontSize: rem(13),
        },
        breadcrumb: {
          color: "var(--mantine-color-gray-6)",
          "&:last-of-type": {
            fontWeight: 500,
          },
        },
        separator: {
          color: "var(--mantine-color-gray-4)",
        },
      },
    },

    Pagination: {
      styles: {
        control: {
          fontSize: rem(13),
          fontWeight: 500,
        },
      },
    },

    Progress: {
      defaultProps: {
        radius: "xl",
      },
    },

    RingProgress: {
      defaultProps: {
        roundCaps: true,
      },
    },

    Avatar: {
      defaultProps: {
        radius: "xl",
        color: "congope",
        variant: "filled",
      },
    },

    AppShell: {
      styles: {
        main: {
          backgroundColor: "var(--mantine-color-gray-0)",
        },
      },
    },
  },
});
