"use client";

import Dexie, { type Table } from "dexie";
import type { AppPrefs, Field, Scout } from "./types";

class MhinduDB extends Dexie {
  fields!: Table<Field, string>;
  scouts!: Table<Scout, string>;
  prefs!: Table<AppPrefs, string>;

  constructor() {
    super("mhindu");
    this.version(1).stores({
      fields: "id, crop, created_at",
      scouts: "id, field_id, taken_at, status",
      prefs: "id",
    });
  }
}

let _db: MhinduDB | null = null;

export function db(): MhinduDB {
  if (typeof window === "undefined") {
    throw new Error("db() can only be used in the browser");
  }
  if (!_db) _db = new MhinduDB();
  return _db;
}

export async function getPrefs(): Promise<AppPrefs> {
  const existing = await db().prefs.get("singleton");
  if (existing) return existing;
  const initial: AppPrefs = {
    id: "singleton",
    current_field_id: null,
    region: "zimbabwe",
    language: "en",
  };
  await db().prefs.put(initial);
  return initial;
}

export async function setCurrentField(fieldId: string | null) {
  const prefs = await getPrefs();
  await db().prefs.put({ ...prefs, current_field_id: fieldId });
}
