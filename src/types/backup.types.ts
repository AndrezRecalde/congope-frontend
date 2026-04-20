export interface BackupItem {
  archivo:           string;  // "congope_backup_2026-04-17_05-02-33.sql"
  tamano_bytes:      number;
  tamano_legible:    string;  // "2.34 MB"
  creado_en:         string;  // "17/04/2026 05:02"
  creado_timestamp:  number;  // unix timestamp
}

export interface BackupMeta {
  total:       number;
  max_backups: number;
  directorio:  string;
}

export interface BackupListResponse {
  success: boolean;
  data:    BackupItem[];
  meta:    BackupMeta;
}
