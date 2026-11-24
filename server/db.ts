import fs from 'node:fs';
import path from 'node:path';
import type { Database } from './types.ts';

const dir = path.join(import.meta.dirname, 'data');
const file = path.join(dir, 'db.json');

const empty = (): Database => ({
  users: [],
  sessions: [],
  orders: [],
  resetCodes: [],
  favorites: [],
  addresses: [],
  cards: [],
  messages: [],
  reviews: [],
  customDishes: [],
  hiddenDishes: [],
  withdrawals: [],
});

function load(): Database {
  try {
    return { ...empty(), ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch {
    return empty();
  }
}

export const db: Database = load();

export function save(): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

export function reset(): void {
  fs.rmSync(file, { force: true });
}
