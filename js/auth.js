// Innlogging (Google), utlogging og en enkel "auth-guard" som alle
// beskyttede sider kaller ved oppstart.
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { app, FIREBASE_SDK_VERSION } from "./firebase-init.js";
import { ALLOWED_EMAILS } from "./firebase-config.js";

export const auth = getAuth(app);

// Hold brukeren innlogget permanent på denne enheten (til aktiv utlogging).
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Klarte ikke sette login-persistens:", err);
});

export function isEmailAllowed(email) {
  if (!ALLOWED_EMAILS || ALLOWED_EMAILS.length === 0) return true;
  return ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes((email || "").toLowerCase());
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (err) {
    // Popup blir ofte blokkert i innebygde nettlesere (f.eks. hvis appen er
    // åpnet via en lenke inni en annen app) - da faller vi tilbake til redirect.
    if (
      err.code === "auth/popup-blocked" ||
      err.code === "auth/operation-not-supported-in-this-environment" ||
      err.code === "auth/popup-closed-by-user"
    ) {
      return signInWithRedirect(auth, provider);
    }
    throw err;
  }
}

export function logout() {
  return signOut(auth);
}

// Kalles øverst på hver beskyttet side.
// onReady(user) kjøres når vi har en gyldig, godkjent bruker.
export function requireAuth(onReady) {
  // Fanger opp resultatet dersom vi kom fra en redirect-innlogging.
  getRedirectResult(auth).catch((err) => console.warn("Redirect-login feilet:", err));

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      if (!location.pathname.endsWith("login.html")) {
        window.location.href = "login.html";
      }
      return;
    }
    if (!isEmailAllowed(user.email)) {
      alert(
        "Denne Google-kontoen (" +
          user.email +
          ") har ikke tilgang til treningsloggen. Kontakt den som satte opp appen."
      );
      signOut(auth).finally(() => (window.location.href = "login.html"));
      return;
    }
    onReady(user);
  });
}

console.debug("Firebase Auth SDK", FIREBASE_SDK_VERSION);
