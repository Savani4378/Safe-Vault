import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

export interface User {
  id: string;
  pin_hash: string;
  salt: string;
  totp_secret?: string;
  totp_enabled?: boolean;
}

export interface Vault {
  id: string;
  user_id: string;
  vault_name: string;
  container_path: string;
  is_hidden: boolean;
  pin_hash?: string; // Optional custom pin for hidden vault
  salt?: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  timestamp: string;
  details: string;
}

interface Database {
  users: User[];
  vaults: Vault[];
  auditLogs: AuditLog[];
}

export async function initializeDatabase() {
  try {
    await fs.access(DB_FILE);
  } catch {
    const initialData: Database = {
      users: [],
      vaults: [],
      auditLogs: []
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

export async function readDB(): Promise<Database> {
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function writeDB(db: Database): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

export async function logAudit(event_type: string, details: string) {
  const db = await readDB();
  db.auditLogs.push({
    id: Date.now().toString(),
    event_type,
    timestamp: new Date().toISOString(),
    details
  });
  await writeDB(db);
}
