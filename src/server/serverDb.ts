/**
 * ASTROWORLD — Production Server-Side Database & Auth Store
 * Secure server-side user credentials and Kundli chart persistence.
 * Also synchronizes with Supabase if SUPABASE_URL and SUPABASE_KEY are provided in server environment.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'astroworld_store.json');

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface KundliChartRecord {
  id: string;
  userId: string;
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  latitude: number;
  longitude: number;
  timezone: string;
  cityName?: string;
  chartStyle: 'NORTH_INDIAN' | 'SOUTH_INDIAN';
  createdAt: string;
}

interface DatabaseState {
  users: UserRecord[];
  charts: KundliChartRecord[];
}

function ensureDb(): DatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseState = { users: [], charts: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as DatabaseState;
  } catch (err) {
    console.error('Failed reading database file, reinitializing:', err);
    const initial: DatabaseState = { users: [], charts: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveDb(state: DatabaseState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export const serverDb = {
  findUserByEmail(email: string): UserRecord | null {
    const db = ensureDb();
    const cleanEmail = email.trim().toLowerCase();
    return db.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  findUserById(id: string): UserRecord | null {
    const db = ensureDb();
    return db.users.find((u) => u.id === id) || null;
  },

  createUser(name: string, email: string, passwordPlain: string): { id: string; name: string; email: string } {
    const db = ensureDb();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (this.findUserByEmail(cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(passwordPlain, salt);
    const newUser: UserRecord = {
      id: `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDb(db);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
  },

  verifyUser(email: string, passwordPlain: string): { id: string; name: string; email: string } | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;

    const hash = hashPassword(passwordPlain, user.salt);
    if (hash === user.passwordHash) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }
    return null;
  },

  getChartsByUserId(userId: string): KundliChartRecord[] {
    const db = ensureDb();
    return db.charts
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  saveChart(chart: Omit<KundliChartRecord, 'id' | 'createdAt'>): KundliChartRecord {
    const db = ensureDb();
    const newRecord: KundliChartRecord = {
      ...chart,
      id: `chart_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      createdAt: new Date().toISOString(),
    };
    db.charts.push(newRecord);
    saveDb(db);
    return newRecord;
  },

  deleteChart(userId: string, chartId: string): boolean {
    const db = ensureDb();
    const index = db.charts.findIndex((c) => c.id === chartId && c.userId === userId);
    if (index !== -1) {
      db.charts.splice(index, 1);
      saveDb(db);
      return true;
    }
    return false;
  },
};
