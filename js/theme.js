// Håndterer valg av fargetema (isblå = standard, Manglerud Star = klubbtema).
// Temaet lagres delt i Firestore (meta/player.theme, se db.js) slik at alle
// tre kontoene ser samme tema, og caches i localStorage slik at riktig tema
// kan settes umiddelbart ved sideinnlasting (se det lille inline-skriptet
// øverst i <head> på hver side) - uten det ville siden "blinket" i feil
// fargetema før Firestore har svart.
import { listenPlayerProfile, saveTheme as saveThemeToDb } from "./db.js";

export const THEMES = ["ice", "manglerud"];
export const DEFAULT_THEME = "ice";
const STORAGE_KEY = "tl-theme";

function normalize(theme) {
  return THEMES.includes(theme) ? theme : DEFAULT_THEME;
}

export function applyTheme(theme) {
  const t = normalize(theme);
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch (err) {
    // Privat nettlesing e.l. - ikke kritisk, temaet vises fortsatt riktig denne økten.
  }
  return t;
}

export function getCachedTheme() {
  try {
    return normalize(localStorage.getItem(STORAGE_KEY));
  } catch (err) {
    return DEFAULT_THEME;
  }
}

// Kalles på alle innloggede sider (etter requireAuth): lytter i sanntid på
// den delte profilen og oppdaterer temaet automatisk hvis det byttes fra
// profilsiden - på denne eller en annen enhet. Returnerer "unsubscribe".
export function watchSharedTheme() {
  return listenPlayerProfile((player) => {
    applyTheme(player && player.theme);
  });
}

// Setter temaet med en gang (optimistisk) og lagrer det delt i Firestore.
export async function setSharedTheme(theme) {
  const t = applyTheme(theme);
  await saveThemeToDb(t);
  return t;
}
