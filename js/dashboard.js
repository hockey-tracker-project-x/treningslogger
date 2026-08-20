import { CATEGORIES, SKILLS, BADGES } from "./config.js";
import { calcStats, formatMinutes, formatHoursShort } from "./skills.js";
import { getCategory } from "./config.js";

function css(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const PLAYER_PLACEHOLDER_ICON = `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
  <circle cx="12" cy="8" r="4"/>
  <path d="M4 20.5c0-4.4 3.8-7 8-7s8 2.6 8 7v.3H4v-.3Z"/>
</svg>`;

export function renderHockeyCard(container, stats, player, fallbackName) {
  const skillRows = Object.entries(SKILLS)
    .map(([key, def]) => {
      const value = stats.skills[key];
      const pct = Math.round(((value - 10) / (99 - 10)) * 100);
      return `
      <div class="skill-row">
        <span class="skill-icon">${def.icon}</span>
        <span class="skill-label">${def.label}</span>
        <span class="skill-track"><span class="skill-fill" style="width:${Math.max(pct, 3)}%"></span></span>
        <span class="skill-value">${value}</span>
      </div>`;
    })
    .join("");

  const name = (player && player.name) || fallbackName || "Spiller";
  const nickname = player && player.nickname;
  const photoDataUrl = player && player.photoDataUrl;

  container.innerHTML = `
    <div class="hockey-card-wrap">
      <div class="hockey-card">
        <div class="hockey-card-header">
          <div class="hockey-card-photo">
            ${photoDataUrl ? `<img src="${photoDataUrl}" alt="">` : `<span class="placeholder">${PLAYER_PLACEHOLDER_ICON}</span>`}
          </div>
          <div class="hockey-card-overall">${stats.overall}<small>OVERALL</small></div>
          <div class="hockey-card-name">
            <div class="name">${name}</div>
            <div class="role">${nickname ? `«${nickname}»` : "Hockeykort"}</div>
          </div>
        </div>
        <div class="skill-list">${skillRows}</div>
      </div>
    </div>
    <div class="hockey-card-edit-link">
      <a href="profil.html" class="btn btn-ghost btn-sm">✏️ Rediger profil</a>
    </div>
  `;
}

export function renderStatGrid(container, stats) {
  container.innerHTML = `
    <div class="stat-grid">
      <div class="stat-tile">
        <div class="value">${formatHoursShort(stats.minutesThisWeek)}</div>
        <div class="label">Denne uken</div>
      </div>
      <div class="stat-tile">
        <div class="value">${formatHoursShort(stats.minutesThisMonth)}</div>
        <div class="label">Denne måneden</div>
      </div>
      <div class="stat-tile">
        <div class="value">${formatHoursShort(stats.totalMinutesAll)}</div>
        <div class="label">Totalt</div>
      </div>
    </div>
  `;
}

export function renderStreak(container, stats) {
  container.innerHTML = `
    <div class="card">
      <div class="streak-line">
        <span class="flame">${stats.streak > 0 ? "\u{1F525}" : "\u{1F9CA}"}</span>
        <div>
          ${stats.streak}
          <small>${stats.streak === 1 ? "dag på rad med trening" : "dager på rad med trening"}</small>
        </div>
      </div>
    </div>
  `;
}

export function renderDistribution(container, stats) {
  const maxMinutes = Math.max(1, ...CATEGORIES.map((c) => stats.minutesByCategory[c.id] || 0));
  const rows = CATEGORIES.map((c) => {
    const minutes = stats.minutesByCategory[c.id] || 0;
    const pct = Math.round((minutes / maxMinutes) * 100);
    const color = css(c.colorVar);
    return `
      <div class="bar-chart-row">
        <span class="bar-label"><span class="dot" style="background:${color}"></span>${c.label}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${minutes ? Math.max(pct, 3) : 0}%; background:${color}; min-width:${minutes ? "4px" : "0"}"></span></span>
        <span class="bar-value">${formatMinutes(minutes)}</span>
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="card">
      <h2>Fordeling av treningstid</h2>
      <div class="bar-chart">${rows}</div>
    </div>
  `;
}

export function renderBadges(container, stats) {
  const rows = BADGES.map((b) => {
    const earned = stats.earnedBadges.some((e) => e.id === b.id);
    return `<span class="badge${earned ? " earned" : ""}">${b.icon} ${b.label}</span>`;
  }).join("");

  container.innerHTML = `
    <div class="card">
      <h2>Merker</h2>
      <div class="badge-grid">${rows}</div>
    </div>
  `;
}

export function renderRecentSessions(container, sessions) {
  const recent = sessions.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = `
      <div class="card">
        <h2>Siste økter</h2>
        <div class="empty-state">
          <div class="icon">\u{1F3D2}</div>
          <p>Ingen økter logget ennå. Trykk "Logg økt" for å komme i gang!</p>
        </div>
      </div>`;
    return;
  }

  const rows = recent
    .map((s) => {
      const blockLines = (s.blocks || [])
        .map((b) => {
          const cat = getCategory(b.category);
          return `<div class="session-block-line"><span class="dot" style="background:${css(
            cat ? cat.colorVar : "--cat-annet"
          )}"></span>${cat ? cat.label : b.category}<span class="b-min">${formatMinutes(b.minutes)}</span></div>`;
        })
        .join("");
      return `
        <div class="session-item">
          <div class="session-head">
            <span class="session-date">${formatDateNo(s.date)}</span>
            <span class="session-meta">${s.loggedByName || ""} · ${formatMinutes(s.totalMinutes)}</span>
          </div>
          <div class="session-blocks">${blockLines}</div>
        </div>`;
    })
    .join("");

  container.innerHTML = `<div class="card"><h2>Siste økter</h2>${rows}</div>`;
}

export function formatDateNo(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" });
}

export function computeAndRenderAll(sessions, user, refs, player) {
  const stats = calcStats(sessions, todayStr());
  const fallbackName = (user.displayName || "").split(" ")[0];
  renderHockeyCard(refs.card, stats, player, fallbackName);
  renderStatGrid(refs.stats, stats);
  renderStreak(refs.streak, stats);
  renderDistribution(refs.distribution, stats);
  renderBadges(refs.badges, stats);
  renderRecentSessions(refs.recent, sessions);
  return stats;
}
