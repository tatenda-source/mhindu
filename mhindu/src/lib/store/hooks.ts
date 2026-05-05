"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import type { Field, Scout } from "./types";

export function useFields(): Field[] | undefined {
  return useLiveQuery(() => db().fields.orderBy("created_at").reverse().toArray());
}

export function useField(id: string | null | undefined): Field | undefined {
  return useLiveQuery(() => (id ? db().fields.get(id) : undefined), [id]);
}

export function useScout(id: string | null | undefined): Scout | undefined {
  return useLiveQuery(() => (id ? db().scouts.get(id) : undefined), [id]);
}

export function useScoutsForField(fieldId: string | null | undefined): Scout[] | undefined {
  return useLiveQuery<Scout[]>(
    () =>
      fieldId
        ? db().scouts.where("field_id").equals(fieldId).reverse().sortBy("taken_at")
        : Promise.resolve<Scout[]>([]),
    [fieldId],
  );
}

export function useAllScouts(): Scout[] | undefined {
  return useLiveQuery(() => db().scouts.orderBy("taken_at").reverse().toArray());
}
