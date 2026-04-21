"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Box, Container, Title, Text, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { ComparadorSelector } from "@/components/portal/comparador/ComparadorSelector";
import { ComparadorResultados } from "@/components/portal/comparador/ComparadorResultados";
import { portalService } from "@/services/portal.service";
import type { EstadisticasProvincia } from "@/types/comparador.types";

export default function ComparadorPage() {
  const [, setSeleccionadas] = useState<string[]>([]);
  const [resultados, setResultados] = useState<EstadisticasProvincia[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComparar = useCallback(async (ids: string[]) => {
    if (ids.length < 2) return;
    setCargando(true);
    setError(null);

    try {
      const data = await portalService.compararProvincias(ids);
      setResultados(data);
      setSeleccionadas(ids);
    } catch (err) {
      setError("No se pudo cargar la comparación. " + "Intenta nuevamente.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  const handleLimpiar = () => {
    setSeleccionadas([]);
    setResultados([]);
    setError(null);
  };

  return (
    <Box
      style={{
        fontFamily: "var(--font-dm-sans)",
        minHeight: "100vh",
        background: "var(--portal-cream)",
      }}
    >
      <PortalHeader />

      {/* Hero del comparador */}
      <Box
        style={{
          background:
            "linear-gradient(135deg, var(--portal-navy) 0%, var(--portal-blue) 100%)",
          paddingTop: 100,
          paddingBottom: 48,
        }}
      >
        <Container size={1280}>
          {/* Breadcrumb */}
          <Box
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            mb="md"
          >
            <Link
              href="/"
              style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
            >
              Portal
            </Link>
            <span>›</span>
            <span style={{ color: "white" }}>Comparador de provincias</span>
          </Box>

          <Box
            w={48}
            h={3}
            style={{ background: "var(--portal-gold)", borderRadius: 2 }}
            mb="sm"
          />

          <Title
            style={{
              fontFamily: "var(--font-playfair)",
              color: "white",
              lineHeight: 1.2,
            }}
            size={40}
            mb="sm"
          >
            Comparador de Provincias
          </Title>

          <Text
            size="lg"
            style={{ color: "rgba(255,255,255,0.65)", maxWidth: 560 }}
          >
            Selecciona 2 o 3 provincias del Ecuador para comparar su actividad
            de cooperación internacional lado a lado.
          </Text>
        </Container>
      </Box>

      {/* Contenido principal */}
      <Container size={1280} py={48} pb={80}>
        <ComparadorSelector
          onComparar={handleComparar}
          onLimpiar={handleLimpiar}
          cargando={cargando}
          hayResultados={resultados.length > 0}
        />

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
            mt="xl"
            radius="md"
          >
            {error}
          </Alert>
        )}

        {resultados.length > 0 && (
          <Box mt={32}>
            <ComparadorResultados resultados={resultados} />
          </Box>
        )}
      </Container>

      <PortalFooter />
    </Box>
  );
}
