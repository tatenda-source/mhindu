import type { Context } from "../schemas";
import type { PestKbOption } from "../kb-types";

export type WeatherCheck =
  | { ok: true }
  | { ok: false; reason: string };

const DEFAULTS = {
  max_wind_m_s: 6,
  max_rain_prob_24h: 0.5,
  min_temp_c: 10,
  max_temp_c: 35,
};

export function weatherCompatible(option: PestKbOption, context: Context): WeatherCheck {
  if (option.type === "no_action" || option.type === "cultural") {
    return { ok: true };
  }

  const c = option.weather_constraints ?? {};
  const w = context.weather;

  const maxWind = c.max_wind_m_s ?? DEFAULTS.max_wind_m_s;
  if (w.wind_m_s > maxWind) {
    return { ok: false, reason: `wind ${w.wind_m_s} m/s exceeds ${maxWind} m/s for ${option.product_name}` };
  }

  const maxRain = c.max_rain_prob_24h ?? DEFAULTS.max_rain_prob_24h;
  if (w.rain_prob_24h > maxRain) {
    return { ok: false, reason: `rain prob ${w.rain_prob_24h} exceeds ${maxRain} for ${option.product_name}` };
  }

  const minT = c.min_temp_c ?? DEFAULTS.min_temp_c;
  const maxT = c.max_temp_c ?? DEFAULTS.max_temp_c;
  if (w.temp_c < minT || w.temp_c > maxT) {
    return { ok: false, reason: `temp ${w.temp_c}C outside ${minT}-${maxT}C window` };
  }

  return { ok: true };
}
