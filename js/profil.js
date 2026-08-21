// Logikk for profil-siden: rediger utøvernavn, kallenavn og bilde til hockeykortet.
// Bildet lagres komprimert som en data-URL direkte i Firestore-dokumentet
// (meta/player) - det krever ikke Firebase Storage/betalingsplan, men holder
// oss innenfor et fornuftig størrelsesbudsjett.

import { getPlayerProfile, savePlayerProfile } from "./db.js";
import { showToast } from "./nav.js";
import { applyTheme, setSharedTheme, DEFAULT_THEME } from "./theme.js";

const MAX_DATA_URL_LENGTH = 700_000; // ~700 KB som data-URL, trygt under Firestores 1 MB-grense per dokument

function resizeImageFile(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Kunne ikke lese filen."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Filen ser ikke ut til å være et gyldig bilde."));
      img.onload = () => {
        let { width, height } = img;
        if (width >= height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Prøver progressivt mindre/mer komprimerte varianter til den er under grensen.
async function compressToFit(file) {
  const attempts = [
    [420, 0.75],
    [320, 0.68],
    [240, 0.6],
    [180, 0.55],
  ];
  let last = null;
  for (const [maxDim, quality] of attempts) {
    last = await resizeImageFile(file, maxDim, quality);
    if (last.length <= MAX_DATA_URL_LENGTH) return last;
  }
  throw new Error("Bildet er for stort/komplekst til å lagres, selv etter komprimering. Prøv et annet bilde.");
}

export function initProfilForm({
  form,
  nameInput,
  nicknameInput,
  photoPreview,
  photoInput,
  removePhotoBtn,
  saveBtn,
}) {
  let pendingPhotoDataUrl = undefined; // undefined = ikke endret, "" = fjernet, streng = nytt bilde

  function renderPreview(dataUrl) {
    if (dataUrl) {
      photoPreview.innerHTML = `<img src="${dataUrl}" alt="">`;
    } else {
      photoPreview.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20.5c0-4.4 3.8-7 8-7s8 2.6 8 7v.3H4v-.3Z"/>
      </svg>`;
    }
  }

  async function load() {
    try {
      const profile = await getPlayerProfile();
      if (profile) {
        nameInput.value = profile.name || "";
        nicknameInput.value = profile.nickname || "";
        renderPreview(profile.photoDataUrl || "");
      } else {
        renderPreview("");
      }
    } catch (err) {
      console.error(err);
      showToast("Kunne ikke laste profilen.", "error");
      renderPreview("");
    }
  }

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    try {
      photoInput.disabled = true;
      const dataUrl = await compressToFit(file);
      pendingPhotoDataUrl = dataUrl;
      renderPreview(dataUrl);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Kunne ikke behandle bildet.", "error");
    } finally {
      photoInput.disabled = false;
      photoInput.value = "";
    }
  });

  removePhotoBtn.addEventListener("click", () => {
    pendingPhotoDataUrl = "";
    renderPreview("");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.textContent = "Lagrer...";
    try {
      const payload = {
        name: nameInput.value,
        nickname: nicknameInput.value,
      };
      if (pendingPhotoDataUrl !== undefined) {
        payload.photoDataUrl = pendingPhotoDataUrl;
      }
      await savePlayerProfile(payload);
      showToast("Profil lagret! \u{1F3D2}", "success");
      pendingPhotoDataUrl = undefined;
      setTimeout(() => (window.location.href = "index.html"), 700);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Kunne ikke lagre profilen.", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Lagre profil";
    }
  });

  load();
}

// Tema-velger (isblå / Manglerud Star) på profilsiden. Uavhengig av
// profil-skjemaet over, siden temaet lagres separat (samme delte dokument,
// men eget felt) og skal oppdateres med en gang - uten å måtte trykke "Lagre".
export function initThemePicker(container) {
  const buttons = Array.from(container.querySelectorAll("[data-theme-choice]"));

  function setActive(theme) {
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.themeChoice === theme);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const theme = btn.dataset.themeChoice;
      setActive(theme);
      applyTheme(theme); // umiddelbar visuell tilbakemelding
      try {
        await setSharedTheme(theme);
        showToast("Tema oppdatert \u{1F3D2}", "success");
      } catch (err) {
        console.error(err);
        showToast("Kunne ikke lagre temavalget.", "error");
      }
    });
  });

  getPlayerProfile()
    .then((profile) => setActive((profile && profile.theme) || DEFAULT_THEME))
    .catch(() => setActive(DEFAULT_THEME));
}
