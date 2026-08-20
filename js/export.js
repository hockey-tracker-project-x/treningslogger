import { getCategory, CATEGORIES } from "./config.js";
import { formatMinutes } from "./skills.js";

function inRange(dateStr, from, to) {
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

export function buildAndDownloadExport(sessions, { from, to } = {}) {
  if (typeof XLSX === "undefined") {
    throw new Error("Eksport-biblioteket er ikke lastet. Sjekk internettforbindelsen og prøv igjen.");
  }

  const filtered = sessions.filter((s) => inRange(s.date, from, to));

  // ---- Ark 1: Rådata (én rad per kategori-blokk) ----
  const rawRows = [["Dato", "Registrert av", "Kategori", "Minutter", "Timer", "Notat"]];
  filtered
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .forEach((s) => {
      (s.blocks || []).forEach((b) => {
        const cat = getCategory(b.category);
        rawRows.push([
          s.date,
          s.loggedByName || "",
          cat ? cat.label : b.category,
          b.minutes,
          Math.round((b.minutes / 60) * 100) / 100,
          b.note || "",
        ]);
      });
    });

  // ---- Ark 2: Sammendrag per kategori ----
  const catTotals = {};
  CATEGORIES.forEach((c) => (catTotals[c.id] = 0));
  filtered.forEach((s) => (s.blocks || []).forEach((b) => (catTotals[b.category] = (catTotals[b.category] || 0) + b.minutes)));

  const summaryRows = [["Kategori", "Totalt minutter", "Totalt timer"]];
  CATEGORIES.forEach((c) => {
    const min = catTotals[c.id] || 0;
    summaryRows.push([c.label, min, Math.round((min / 60) * 100) / 100]);
  });
  const grandTotal = Object.values(catTotals).reduce((a, b) => a + b, 0);
  summaryRows.push(["", "", ""]);
  summaryRows.push(["Totalt alle kategorier", grandTotal, Math.round((grandTotal / 60) * 100) / 100]);

  // ---- Ark 3: Sammendrag per måned x kategori (for sponsor-rapport) ----
  const months = Array.from(new Set(filtered.map((s) => monthKey(s.date)))).sort();
  const monthlyRows = [["Måned", ...CATEGORIES.map((c) => c.label), "Totalt timer"]];
  months.forEach((m) => {
    const perCat = {};
    CATEGORIES.forEach((c) => (perCat[c.id] = 0));
    filtered
      .filter((s) => monthKey(s.date) === m)
      .forEach((s) => (s.blocks || []).forEach((b) => (perCat[b.category] = (perCat[b.category] || 0) + b.minutes)));
    const rowTotal = Object.values(perCat).reduce((a, b) => a + b, 0);
    monthlyRows.push([
      m,
      ...CATEGORIES.map((c) => Math.round((perCat[c.id] / 60) * 100) / 100),
      Math.round((rowTotal / 60) * 100) / 100,
    ]);
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rawRows), "Rådata");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), "Sammendrag - kategori");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(monthlyRows), "Sammendrag - per måned");

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Treningslogg_${stamp}.xlsx`);

  return { rowCount: rawRows.length - 1, sessionCount: filtered.length };
}
