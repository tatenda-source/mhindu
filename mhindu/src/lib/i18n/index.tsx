"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import en from "./catalogs/en";
import ny from "./catalogs/ny";
import sn from "./catalogs/sn";
import sw from "./catalogs/sw";

export type Locale = "en" | "sn" | "sw" | "ny";

const STORAGE_KEY = "mhindu_locale";
const DEFAULT_LOCALE: Locale = "en";

const catalogs: Record<Locale, Record<string, string>> = { en, sn, sw, ny };

function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "sn" || v === "sw" || v === "ny";
}

function readStored(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLocale(v) ? v : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStored);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // storage blocked — locale still works for the session
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const catalog = catalogs[locale];
      let str = catalog[key] ?? catalogs.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

export function useT(): (
  key: string,
  vars?: Record<string, string | number>,
) => string {
  return useLocale().t;
}

export function setLocale(): never {
  throw new Error("setLocale must be called inside a LocaleProvider context");
}
