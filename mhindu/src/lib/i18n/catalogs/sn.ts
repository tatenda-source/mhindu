// Shona (sn) — keys marked // TODO: native review need verification by a native speaker
// before shipping to farmer-facing surfaces. English strings are left as safe fallback.

const sn: Record<string, string> = {
  "nav.scout": "Tsvaga", // TODO: native review
  "nav.fields": "Minda Yangu", // TODO: native review
  "nav.ledger": "Muchengetedzo", // TODO: native review

  "scout.cta": "Tora mufananidzo wechipembenene", // TODO: native review
  "scout.permission_camera": "Tinoda kamera yako kuti tizive chipembenene.", // TODO: native review
  "scout.permission_location": "Tinoda nzvimbo yako kuti tisave tsvaga.", // TODO: native review
  "scout.processing": "Tiri kuona mufananidzo wako nemodeli...", // TODO: native review

  "verdict.severity_light": "Zvishoma", // TODO: native review
  "verdict.severity_moderate": "Zvepakati", // TODO: native review
  "verdict.severity_heavy": "Zvakanyanya", // TODO: native review
  "verdict.confidence_low": "Tisingazivi zvakanyanya", // TODO: native review
  "verdict.confidence_medium": "Tine chivimbo chapakati", // TODO: native review
  "verdict.confidence_high": "Tine chivimbo chakanyanya", // TODO: native review
  "verdict.why": "Nei?", // TODO: native review
  "verdict.hide": "Viga",

  "treatment.no_action": "Hapana chinofanira kuitwa", // TODO: native review
  "treatment.cultural": "Kurima zvakanaka", // TODO: native review
  "treatment.biological": "Kushandisa zvibereko", // TODO: native review
  "treatment.mechanical": "Kushandisa maoko", // TODO: native review
  "treatment.chemical": "Mushonga — wekupedzisira", // TODO: native review
  "treatment.order_via_whatsapp": "Oda kubva Real IPM kuburikidza ne-WhatsApp", // TODO: native review
  "treatment.recheck_in_days": "Tsvaga zvakare mushure memazuva {days}", // TODO: native review
  "treatment.steps_heading": "Hurongwa hwako", // TODO: native review
  "treatment.saved_this_step": "Mushonga wakachengetedzwa", // TODO: native review

  "ledger.pesticide_saved": "Mushonga wakachengetedzwa chikore chino", // TODO: native review
  "ledger.litres": "marita", // TODO: native review
  "ledger.jug_empty": "Yakasara — mushonga wepurazi", // TODO: native review
  "ledger.jug_full": "Yakachengetedzwa kusvika ino", // TODO: native review

  "field.add_first": "Wedzera munda wako wekutanga", // TODO: native review
  "field.crop_maize": "Chibage", // TODO: native review
  "field.crop_tomato": "Tomato",
  "field.pressure_calm": "Zvakatulia", // TODO: native review
  "field.pressure_elevated": "Zvakakwira", // TODO: native review
  "field.pressure_critical": "Njodzi", // TODO: native review
  "field.last_scouted": "Yakatsvagwa", // TODO: native review
  "field.never_scouted": "Isati yatsvagwa", // TODO: native review

  "unknown.cant_tell":
    "Ndinoshaya kuona kubva pamufananidzo uyu. Edza zvakare nendira yakajeka yeshizha.", // TODO: native review

  "common.loading": "Kufunga...", // TODO: native review
  "common.retry": "Edza zvakare", // TODO: native review
  "common.save_and_decide_later": "Chengetedza mufananidzo, usarudze gare gare", // TODO: native review
};

export default sn;
