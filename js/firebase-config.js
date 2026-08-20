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
    apiKey: "AIzaSyBvByyFNtxRA686GSTHVEcC5ADVKTIExDY",
    authDomain: "treningslogger.firebaseapp.com",
    projectId: "treningslogger",
    storageBucket: "treningslogger.firebasestorage.app",
    messagingSenderId: "589505064971",
    appId: "1:589505064971:web:1719bc39b3413f8c29570e",
  };

// De godkjente e-postadressene (Google-kontoene til deg, sønnen din, osv.).
// Dette er en EKSTRA sperre i selve appen (i tillegg til Firestore-sikkerhets-
// reglene i Firebase-konsollen) - så uvedkommende ikke kommer inn selv om
// noen skulle finne nettadressen.
export const ALLOWED_EMAILS = [
  "aleksandernyland@gmail.com",
  "fredrik.d.nyland@gmail.com",
  "madeleinedaleng@gmail.com",
];
