// =============================================================================
// Sentral konfigurasjon: kategorier, skills og skill-formel.
// Endre TALL/TEKST her - resten av appen leser fra denne filen.
// =============================================================================

// Hvor mange timer i én kategori som gir maks skill (99).
export const HOURS_FOR_MAX = 5000;
export const MIN_SKILL = 10;
export const MAX_SKILL = 99;

// De 6 hockey-skillsene. "colorVar" peker på en CSS-variabel definert i styles.css.
export const SKILLS = {
  fysikk:   { label: "Fysikk",              icon: "\u{1F4AA}", colorVar: "--cat-barmark" },
  skoyte:   { label: "Skøyteferdigheter",   icon: "⛸️", colorVar: "--cat-skoyting" },
  iq:       { label: "Hockey IQ",            icon: "\u{1F9E0}", colorVar: "--cat-spilldrill" },
  hender:   { label: "Soft Hands",           icon: "\u{1F3D2}", colorVar: "--cat-kolleteknikk" },
  robust:   { label: "Robust",               icon: "\u{1F6E1}️", colorVar: "--cat-rehab" },
  skudd:    { label: "Skudd",                icon: "\u{1F3AF}", colorVar: "--cat-skudd" },
};

// Kategorier som kan velges når man logger en økt.
// "skill" peker til nøkkelen i SKILLS over, eller null hvis kategorien ikke
// skal påvirke noe skill (f.eks. "Annet").
export const CATEGORIES = [
  { id: "barmark",       label: "Barmark",                skill: "fysikk", colorVar: "--cat-barmark" },
  { id: "skoyting",      label: "Skøytegåing",             skill: "skoyte", colorVar: "--cat-skoyting" },
  { id: "spilldrill",    label: "Spill / drill-øvelser",   skill: "iq",     colorVar: "--cat-spilldrill" },
  { id: "kolleteknikk",  label: "Kølleteknikk",            skill: "hender", colorVar: "--cat-kolleteknikk" },
  { id: "rehab",         label: "Rehab / stretching",      skill: "robust", colorVar: "--cat-rehab" },
  { id: "skudd",         label: "Skuddtrening",            skill: "skudd",  colorVar: "--cat-skudd" },
  { id: "annet",         label: "Annet (kamp, styrke, ...)", skill: null,   colorVar: "--cat-annet" },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}

// Badges / milepæler - enkel, utvidbar liste.
// "check(stats)" får statistikk-objektet fra skills.js og returnerer true/false.
export const BADGES = [
  { id: "first-session", label: "Første økt logget", icon: "\u{1F7E2}", check: (s) => s.sessionCount >= 1 },
  { id: "ten-sessions", label: "10 økter", icon: "\u{1F51F}", check: (s) => s.sessionCount >= 10 },
  { id: "fifty-sessions", label: "50 økter", icon: "\u{1F4AF}", check: (s) => s.sessionCount >= 50 },
  { id: "hundred-sessions", label: "100 økter", icon: "\u{1F3C6}", check: (s) => s.sessionCount >= 100 },
  { id: "ten-hours", label: "10 timer totalt", icon: "⏱️", check: (s) => s.totalMinutesAll >= 600 },
  { id: "fifty-hours", label: "50 timer totalt", icon: "⛸️", check: (s) => s.totalMinutesAll >= 3000 },
  { id: "hundred-hours", label: "100 timer totalt", icon: "\u{1F3C5}", check: (s) => s.totalMinutesAll >= 6000 },
  { id: "streak-7", label: "7 dagers streak", icon: "\u{1F525}", check: (s) => s.streak >= 7 },
  { id: "streak-30", label: "30 dagers streak", icon: "\u{1F31F}", check: (s) => s.streak >= 30 },
  { id: "skill-50", label: "Én skill over 50", icon: "⬆️", check: (s) => Object.values(s.skills).some((v) => v >= 50) },
  { id: "skill-99", label: "En skill maxet (99)", icon: "\u{1F451}", check: (s) => Object.values(s.skills).some((v) => v >= 99) },
];
