// =============================================================================
// FYLL INN FØR APPEN KAN BRUKES.
// Se SETUP.md for nøyaktige steg-for-steg-instruksjoner.
//
// 1. Gå til https://console.firebase.google.com -> opprett et gratis prosjekt.
// 2. Project settings (tannhjul) -> "Your apps" -> velg web (</>) -> registrer appen.
// 3. Kopier "firebaseConfig"-objektet du får opp, og lim inn i stedet for
//    verdiene under.
// =============================================================================

export const firebaseConfig = {
  apiKey: "FYLL_INN_API_KEY",
  authDomain: "FYLL_INN.firebaseapp.com",
  projectId: "FYLL_INN",
  storageBucket: "FYLL_INN.appspot.com",
  messagingSenderId: "FYLL_INN",
  appId: "FYLL_INN",
};

// De to godkjente e-postadressene (Google-kontoene til deg og sønnen din).
// Dette er en EKSTRA sperre i selve appen (i tillegg til Firestore-reglene i
// firestore.rules) - så uvedkommende ikke kommer inn selv om noen skulle
// finne nettadressen.
export const ALLOWED_EMAILS = [
  "eksempel.far@gmail.com",
  "eksempel.sonn@gmail.com",
];
