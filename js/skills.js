// Beregning av skills, streak, totaler og badges - ren funksjonslogikk uten
// avhengighet til DOM, så den er lett å teste/gjenbruke fra flere sider.
import { CATEGORIES, SKILLS, HOURS_FOR_MAX, MIN_SKILL, MAX_SKILL, BADGES } from "./config.js";

export function calcSkillFromMinutes(totalMinutes) {
  const hours = totalMinutes / 60;
  const raw = MIN_SKILL + (MAX_SKILL - MIN_SKILL) * Math.min(hours / HOURS_FOR_MAX, 1);
  return Math.max(MIN_SKILL, Math.min(MAX_SKILL, Math.round(raw)));
}

function toDateOnly(dateStr) {
  // "YYYY-MM-DD" -> Date ved midnatt lokal tid (unngår tidssone-forskyvning)
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((a - b) / MS);
}

// Streak = antall påfølgende dager (fra i dag, eller fra i går hvis ingenting
// er logget i dag ennå) med minst én registrert økt.
export function calcStreak(sessions, todayStr) {
  const uniqueDates = new Set(sessions.map((s) => s.date));
  if (uniqueDates.size === 0) return 0;

  const today = toDateOnly(todayStr);
  let cursor = today;

  // Hvis ingenting er logget i dag, start sjekken fra i går i stedet
  // (streaken skal ikke nullstilles bare fordi dagens økt ikke er logget ENNÅ).
  if (!uniqueDates.has(todayStr)) {
    cursor = new Date(today);
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
      cursor.getDate()
    ).padStart(2, "0")}`;
    if (uniqueDates.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calcStats(sessions, todayStr) {
  const minutesByCategory = {};
  CATEGORIES.forEach((c) => (minutesByCategory[c.id] = 0));
  const minutesBySkill = {};
  Object.keys(SKILLS).forEach((k) => (minutesBySkill[k] = 0));

  let totalMinutesAll = 0;
  let minutesThisWeek = 0;
  let minutesThisMonth = 0;

  const today = toDateOnly(todayStr);
  const startOfWeek = new Date(today);
  const isoDay = (today.getDay() + 6) % 7; // mandag = 0
  startOfWeek.setDate(today.getDate() - isoDay);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  sessions.forEach((s) => {
    const sessionDate = toDateOnly(s.date);
    (s.blocks || []).forEach((b) => {
      const minutes = Number(b.minutes) || 0;
      minutesByCategory[b.category] = (minutesByCategory[b.category] || 0) + minutes;
      totalMinutesAll += minutes;

      const cat = CATEGORIES.find((c) => c.id === b.category);
      if (cat && cat.skill) {
        minutesBySkill[cat.skill] += minutes;
      }
      if (sessionDate >= startOfWeek) minutesThisWeek += minutes;
      if (sessionDate >= startOfMonth) minutesThisMonth += minutes;
    });
  });

  const skills = {};
  Object.keys(SKILLS).forEach((k) => {
    skills[k] = calcSkillFromMinutes(minutesBySkill[k]);
  });
  const overall = Math.round(
    Object.values(skills).reduce((a, b) => a + b, 0) / Object.values(skills).length
  );

  const stats = {
    minutesByCategory,
    minutesBySkill,
    totalMinutesAll,
    minutesThisWeek,
    minutesThisMonth,
    skills,
    overall,
    sessionCount: sessions.length,
    streak: calcStreak(sessions, todayStr),
  };

  stats.earnedBadges = BADGES.filter((b) => b.check(stats));
  return stats;
}

export function formatMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} t`;
  return `${h} t ${m} min`;
}

export function formatHoursShort(min) {
  return (min / 60).toFixed(1).replace(".0", "") + " t";
}
