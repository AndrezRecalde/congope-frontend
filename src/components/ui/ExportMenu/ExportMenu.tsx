'use client'

import { Menu, Button } from '@mantine/core';
import {
  IconDownload,
  IconFileTypePdf,
  IconFileTypeXls,
  IconCsv,
} from '@tabler/icons-react';

interface ExportMenuProps {
  onExportar: (formato: 'pdf' | 'excel' | 'csv') => void;
  loading?:   boolean;
  disabled?:  boolean;
}

export function ExportMenu({
  onExportar,
  loading  = false,
  disabled = false,
}: ExportMenuProps) {
  return (
    <Menu
      shadow="md"
      width={160}
      position="bottom-end"
      withArrow
    >
      <Menu.Target>
        <Button
          variant="outline"
          color="congope"
          leftSection={<IconDownload size={15} />}
          loading={loading}
          disabled={disabled}
          size="sm"
        >
          Exportar
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconFileTypePdf size={14} />}
          onClick={() => onExportar('pdf')}
        >
          PDF
        </Menu.Item>
        <Menu.Item
          leftSection={<IconFileTypeXls size={14} />}
          onClick={() => onExportar('excel')}
        >
          Excel (.xlsx)
        </Menu.Item>
        <Menu.Item
          leftSection={<IconCsv size={14} />}
          onClick={() => onExportar('csv')}
        >
          CSV
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
