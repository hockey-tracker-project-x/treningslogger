// Felles UI-brikker som gjenbrukes på alle sider: bunnmeny, toppbar med
// bruker-chip/logg-ut, og en enkel "toast"-varsling.
import { logout } from "./auth.js";

const NAV_ITEMS = [
  { id: "dashboard", href: "index.html", label: "Dashboard", icon: "\u{1F3D2}" },
  { id: "logg", href: "logg.html", label: "Logg økt", icon: "➕" },
  { id: "historikk", href: "historikk.html", label: "Historikk", icon: "\u{1F4CB}" },
  { id: "eksport", href: "eksport.html", label: "Eksport", icon: "\u{1F4E4}" },
];

export function renderBottomNav(activeId) {
  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.innerHTML = NAV_ITEMS.map(
    (item) => `
    <a href="${item.href}" class="nav-item${item.id === activeId ? " active" : ""}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </a>`
  ).join("");
  document.body.appendChild(nav);
}

export function renderTopbar(container, user) {
  const initials = (user.displayName || user.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstName = (user.displayName || user.email || "").split(" ")[0];

  container.innerHTML = `
    <div class="topbar">
      <div class="brand"><span class="puck-dot"></span> Treningslogger</div>
      <div class="user-chip">
        ${
          user.photoURL
            ? `<img src="${user.photoURL}" alt="">`
            : `<span class="avatar-fallback">${initials}</span>`
        }
        <span>${firstName}</span>
        <button type="button" id="logout-btn" title="Logg ut">Logg ut</button>
      </div>
    </div>
  `;

  container.querySelector("#logout-btn").addEventListener("click", async () => {
    if (confirm("Logge ut?")) {
      await logout();
      window.location.href = "login.html";
    }
  });
}

let toastTimer = null;
export function showToast(message, type = "success") {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
