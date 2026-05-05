// Chichewa (ny) — keys marked // TODO: native review need verification by a native speaker
// before shipping to farmer-facing surfaces. English strings are left as safe fallback.

const ny: Record<string, string> = {
  "nav.scout": "Fufuza", // TODO: native review
  "nav.fields": "Minda Yanga", // TODO: native review
  "nav.ledger": "Zosunga", // TODO: native review

  "scout.cta": "Tenga chithunzi cha tizilombo", // TODO: native review
  "scout.permission_camera": "Tikufuna kamera yako kuti tizindikire tizilombo.", // TODO: native review
  "scout.permission_location": "Tikufuna malo ako kuti tizindikire kafukufuku.", // TODO: native review
  "scout.processing": "Tikuona chithunzi chako ndi modeli...", // TODO: native review

  "verdict.severity_light": "Pang'ono", // TODO: native review
  "verdict.severity_moderate": "Pakati", // TODO: native review
  "verdict.severity_heavy": "Kwambiri", // TODO: native review
  "verdict.confidence_low": "Tsimikiziro laling'ono", // TODO: native review
  "verdict.confidence_medium": "Tsimikiziro lapakati", // TODO: native review
  "verdict.confidence_high": "Tsimikiziro lalikulu", // TODO: native review
  "verdict.why": "Chifukwa chake?", // TODO: native review
  "verdict.hide": "Bisa",

  "treatment.no_action": "Palibe chochita", // TODO: native review
  "treatment.cultural": "Kulima bwino", // TODO: native review
  "treatment.biological": "Njira ya zachilengedwe", // TODO: native review
  "treatment.mechanical": "Njira ya manja", // TODO: native review
  "treatment.chemical": "Mankhwala — chisankho chosederera", // TODO: native review
  "treatment.order_via_whatsapp": "Lamula kuchokera Real IPM kudzera WhatsApp", // TODO: native review
  "treatment.recheck_in_days": "Fufuza kachiwiri patapita masiku {days}", // TODO: native review
  "treatment.steps_heading": "Dongosolo lako", // TODO: native review
  "treatment.saved_this_step": "Mankhwala opulumuka", // TODO: native review

  "ledger.pesticide_saved": "Mankhwala opulumutsidwa nyengo ino", // TODO: native review
  "ledger.litres": "malita", // TODO: native review
  "ledger.jug_empty": "Yopanda — mankhwala achikhalidwe", // TODO: native review
  "ledger.jug_full": "Yopulumutsidwa mpaka tsopano", // TODO: native review

  "field.add_first": "Onjezani munda wanu woyamba", // TODO: native review
  "field.crop_maize": "Chimanga", // TODO: native review
  "field.crop_tomato": "Tomato",
  "field.pressure_calm": "Bwino",
  "field.pressure_elevated": "Ikukwera", // TODO: native review
  "field.pressure_critical": "Ngozi", // TODO: native review
  "field.last_scouted": "Inafufuzidwa", // TODO: native review
  "field.never_scouted": "Sinafufuzidwe", // TODO: native review

  "unknown.cant_tell":
    "Sindizindikira kuchokera ku chithunzi ichi. Yesaninso ndi chithunzi chowonekera bwino cha tsamba.", // TODO: native review

  "common.loading": "Kukonzekera...", // TODO: native review
  "common.retry": "Yesaninso", // TODO: native review
  "common.save_and_decide_later": "Sunga chithunzi, ganetsa pambuyo pake", // TODO: native review
};

export default ny;
