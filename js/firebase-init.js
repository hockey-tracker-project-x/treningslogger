// Sentral, delt Firebase-initialisering. Alle andre js-filer importerer "app"
// herfra, slik at initializeApp() bare kalles én gang.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";

export const FIREBASE_SDK_VERSION = "10.14.1";
export const app = initializeApp(firebaseConfig);
