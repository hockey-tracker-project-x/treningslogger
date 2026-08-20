// Registrerer service worker for offline-støtte og "installer app"-oppførsel.
// Inkluderes med et vanlig <script>-tag (ikke type="module") på hver side.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((err) => {
      console.warn("Kunne ikke registrere service worker:", err);
    });
  });
}
