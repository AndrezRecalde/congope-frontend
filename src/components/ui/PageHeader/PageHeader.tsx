import { Group, Stack, Title, Text, Divider, Anchor, Box } from "@mantine/core";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  acciones?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function PageHeader({
  titulo,
  descripcion,
  acciones,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <Box mb="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Group gap={8} mb={4}>
              {breadcrumbs.map((b, i) => (
                <Group gap={8} key={i}>
                  {b.href ? (
                    <Anchor component={Link} href={b.href} size="xs" c="dimmed">
                      {b.label}
                    </Anchor>
                  ) : (
                    <Text size="xs" c="dimmed">
                      {b.label}
                    </Text>
                  )}
                  {i < breadcrumbs.length - 1 && (
                    <IconChevronRight
                      size={12}
                      color="var(--mantine-color-gray-5)"
                    />
                  )}
                </Group>
              ))}
            </Group>
          )}

          <Title order={2}>{titulo}</Title>

          {descripcion && (
            <Text size="sm" c="dimmed" maw={600}>
              {descripcion}
            </Text>
          )}
        </Stack>

        {acciones && (
          <Group gap="sm" mt={breadcrumbs ? 20 : 0}>
            {acciones}
          </Group>
        )}
      </Group>

      <Divider mt="md" />
    </Box>
  );
}
