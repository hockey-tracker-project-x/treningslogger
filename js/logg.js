import { CATEGORIES } from "./config.js";
import { addSession, updateSession, getSession } from "./db.js";
import { showToast } from "./nav.js";

const STEP = 15;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function categoryOptions(selected) {
  return CATEGORIES.map(
    (c) => `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${c.label}</option>`
  ).join("");
}

let blockCounter = 0;

function blockRowHtml(block) {
  const id = `block-${blockCounter++}`;
  const minutes = block?.minutes ?? STEP;
  const category = block?.category ?? CATEGORIES[0].id;
  const note = block?.note ?? "";
  return `
    <div class="block-row" data-id="${id}">
      <button type="button" class="remove-block" aria-label="Fjern kategori" data-remove="${id}">✕</button>
      <label>Kategori</label>
      <select data-field="category" data-id="${id}">${categoryOptions(category)}</select>

      <label>Minutter (15-min steg)</label>
      <div class="stepper">
        <button type="button" data-action="dec" data-id="${id}">−</button>
        <div class="stepper-value" data-value="${id}">${minutes}<small>minutter</small></div>
        <button type="button" data-action="inc" data-id="${id}">+</button>
      </div>

      <label style="margin-top:14px;">Notat (valgfritt)</label>
      <input type="text" data-field="note" data-id="${id}" value="${note.replace(/"/g, "&quot;")}" placeholder="F.eks. sted, motstander, fokusområde..." />
    </div>
  `;
}

export function initLoggForm({ formEl, blocksContainer, addBlockBtn, dateInput, saveBtn, headingEl }, user) {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");
  const minuteValues = new Map(); // id -> minutes

  function readBlockFromDom(rowEl) {
    const id = rowEl.dataset.id;
    const category = rowEl.querySelector('[data-field="category"]').value;
    const note = rowEl.querySelector('[data-field="note"]').value;
    const minutes = minuteValues.get(id) ?? STEP;
    return { category, minutes, note };
  }

  function addBlockRow(block) {
    const html = blockRowHtml(block);
    blocksContainer.insertAdjacentHTML("beforeend", html);
    const rowEl = blocksContainer.lastElementChild;
    const id = rowEl.dataset.id;
    minuteValues.set(id, block?.minutes ?? STEP);
    updateRemoveButtons();
  }

  function updateRemoveButtons() {
    const rows = blocksContainer.querySelectorAll(".block-row");
    rows.forEach((r) => {
      const btn = r.querySelector(".remove-block");
      btn.style.visibility = rows.length > 1 ? "visible" : "hidden";
    });
  }

  blocksContainer.addEventListener("click", (e) => {
    const decId = e.target.closest('[data-action="dec"]')?.dataset.id;
    const incId = e.target.closest('[data-action="inc"]')?.dataset.id;
    const removeId = e.target.closest("[data-remove]")?.dataset.remove;

    if (decId) {
      const current = minuteValues.get(decId) ?? STEP;
      const next = Math.max(STEP, current - STEP);
      minuteValues.set(decId, next);
      blocksContainer.querySelector(`[data-value="${decId}"]`).firstChild.textContent = next;
    }
    if (incId) {
      const current = minuteValues.get(incId) ?? STEP;
      const next = current + STEP;
      minuteValues.set(incId, next);
      blocksContainer.querySelector(`[data-value="${incId}"]`).firstChild.textContent = next;
    }
    if (removeId) {
      const row = blocksContainer.querySelector(`.block-row[data-id="${removeId}"]`);
      if (row && blocksContainer.querySelectorAll(".block-row").length > 1) {
        row.remove();
        minuteValues.delete(removeId);
        updateRemoveButtons();
      }
    }
  });

  addBlockBtn.addEventListener("click", () => addBlockRow());

  dateInput.value = todayStr();
  dateInput.max = todayStr();

  let editingSessionId = null;

  async function loadForEdit() {
    if (!editId) {
      addBlockRow();
      return;
    }
    const session = await getSession(editId);
    if (!session) {
      showToast("Fant ikke økten som skulle redigeres.", "error");
      addBlockRow();
      return;
    }
    editingSessionId = session.id;
    headingEl.textContent = "Rediger økt";
    saveBtn.textContent = "Lagre endringer";
    dateInput.value = session.date;
    blocksContainer.innerHTML = "";
    (session.blocks || []).forEach((b) => addBlockRow(b));
  }

  loadForEdit();

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.textContent = "Lagrer...";
    try {
      const blocks = Array.from(blocksContainer.querySelectorAll(".block-row")).map(readBlockFromDom);
      const date = dateInput.value || todayStr();

      if (editingSessionId) {
        await updateSession(editingSessionId, { date, blocks });
        showToast("Endringer lagret!", "success");
        setTimeout(() => (window.location.href = "historikk.html"), 700);
      } else {
        await addSession({ date, blocks, user });
        showToast("Økt lagret! \u{1F3D2}", "success");
        blocksContainer.innerHTML = "";
        minuteValues.clear();
        addBlockRow();
        dateInput.value = todayStr();
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Kunne ikke lagre økten.", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = editingSessionId ? "Lagre endringer" : "Lagre økt";
    }
  });
}
