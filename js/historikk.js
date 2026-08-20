import { CATEGORIES, getCategory } from "./config.js";
import { deleteSession } from "./db.js";
import { formatMinutes } from "./skills.js";
import { formatDateNo } from "./dashboard.js";
import { showToast } from "./nav.js";

function css(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

export function initHistorikk({ listEl, categoryFilter, personFilter }) {
  let allSessions = [];

  function populatePersonFilter() {
    const names = Array.from(new Set(allSessions.map((s) => s.loggedByName).filter(Boolean))).sort();
    const current = personFilter.value;
    personFilter.innerHTML =
      `<option value="">Alle</option>` + names.map((n) => `<option value="${n}">${n}</option>`).join("");
    if (names.includes(current)) personFilter.value = current;
  }

  function render() {
    const catVal = categoryFilter.value;
    const personVal = personFilter.value;

    const filtered = allSessions.filter((s) => {
      if (personVal && s.loggedByName !== personVal) return false;
      if (catVal && !(s.blocks || []).some((b) => b.category === catVal)) return false;
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="icon">\u{1F50D}</div>
          <p>Ingen økter matcher filteret.</p>
        </div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((s) => {
        const blockLines = (s.blocks || [])
          .filter((b) => !catVal || b.category === catVal)
          .map((b) => {
            const cat = getCategory(b.category);
            const note = b.note ? ` <span class="muted">(${escapeHtml(b.note)})</span>` : "";
            return `<div class="session-block-line"><span class="dot" style="background:${css(
              cat ? cat.colorVar : "--cat-annet"
            )}"></span>${cat ? cat.label : b.category}${note}<span class="b-min">${formatMinutes(b.minutes)}</span></div>`;
          })
          .join("");

        return `
          <div class="session-item" data-id="${s.id}">
            <div class="session-head">
              <span class="session-date">${formatDateNo(s.date)}</span>
              <span class="session-meta">${s.loggedByName || ""} · ${formatMinutes(s.totalMinutes)}</span>
            </div>
            <div class="session-blocks">${blockLines}</div>
            <div class="session-actions">
              <a class="btn btn-sm btn-secondary" href="logg.html?id=${s.id}">Rediger</a>
              <button type="button" class="btn btn-sm btn-danger" data-delete="${s.id}">Slett</button>
            </div>
          </div>`;
      })
      .join("");
  }

  listEl.addEventListener("click", async (e) => {
    const delId = e.target.closest("[data-delete]")?.dataset.delete;
    if (!delId) return;
    if (!confirm("Slette denne økten? Dette kan ikke angres.")) return;
    try {
      await deleteSession(delId);
      showToast("Økt slettet", "success");
    } catch (err) {
      console.error(err);
      showToast("Kunne ikke slette økten.", "error");
    }
  });

  categoryFilter.innerHTML =
    `<option value="">Alle kategorier</option>` +
    CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join("");

  categoryFilter.addEventListener("change", render);
  personFilter.addEventListener("change", render);

  return {
    setSessions(sessions) {
      allSessions = sessions;
      populatePersonFilter();
      render();
    },
  };
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
