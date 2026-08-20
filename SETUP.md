# Oppsett av Treningslogger

Denne appen er ferdig kodet, men trenger noen **engangs-steg** fra deg før den kan tas i bruk. Alt dette er gratis og tar ca. 20-30 minutter totalt. Følg stegene i rekkefølge.

---

## 1. Opprett Firebase-prosjekt

1. Gå til https://console.firebase.google.com og logg inn med en Google-konto.
2. Klikk **"Legg til prosjekt"** (Add project). Gi det et navn, f.eks. `treningslogger`.
3. Du kan skru AV Google Analytics for dette prosjektet (ikke nødvendig).
4. Trykk **Opprett prosjekt**.

## 2. Skru på Google-innlogging

1. I venstremenyen: **Build → Authentication**.
2. Trykk **Get started**.
3. Under fanen **Sign-in method**, velg **Google** i listen → skru den **på** → velg en support-e-post → **Save**.

## 3. Opprett database (Firestore)

1. I venstremenyen: **Build → Firestore Database**.
2. Trykk **Create database**.
3. Velg **Start in production mode** (vi limer inn egne regler i steg 4).
4. Velg en region i nærheten (f.eks. `eur3 (europe-west)`).

## 4. Lim inn sikkerhetsreglene

1. Fortsatt i Firestore Database → fanen **Rules**.
2. Slett det som står der, og lim inn reglene du har fått fra Claude i chatten (de starter med `rules_version = '2';`).
3. **Viktig:** bytt ut de to e-postadressene i reglene med de faktiske Google-kontoene til deg og sønnen din.
4. Trykk **Publish**.

## 5. Registrer web-appen og hent konfigurasjon

1. Klikk tannhjulet øverst til venstre → **Project settings**.
2. Under **"Your apps"**, klikk web-ikonet `</>`.
3. Gi appen et kallenavn, f.eks. `treningslogger-web`. Du trenger IKKE Firebase Hosting her - hopp over det steget.
4. Du får opp et `firebaseConfig`-objekt. Kopier hele det.
5. Åpne filen `js/firebase-config.js` i prosjektmappen, og lim inn verdiene i stedet for `"FYLL_INN..."`.
6. I samme fil: bytt ut `ALLOWED_EMAILS` med de to faktiske Google-e-postadressene (de samme som i steg 4).

## 6. Legg til godkjente domener for innlogging

1. **Authentication → Settings → Authorized domains**.
2. Legg til domenet du får fra GitHub Pages i steg 8 (f.eks. `dittbrukernavn.github.io`). `localhost` er allerede godkjent, så lokal testing (steg 7) fungerer med én gang.

## 7. Test lokalt før du publiserer

Du kan teste appen på PC-en før den legges ut på nett:

1. Sørg for at `js/firebase-config.js` er fylt ut (steg 5).
2. Dobbeltklikk-metoden (åpne `index.html` direkte i nettleseren) fungerer *delvis*, men innlogging/Firestore krever at siden lastes over `http://` - be Claude sette opp en enkel lokal server om ønskelig, eller gå rett til GitHub Pages-steget under (raskest).

## 8. Legg appen på GitHub Pages (gratis hosting)

Dette gjør Claude for deg via `git`, men du må gjøre disse tingene selv først:

1. Opprett en gratis konto på https://github.com hvis du ikke har en.
2. Opprett et nytt, **offentlig** repository (f.eks. `treningslogger`). Ikke huk av for README/gitignore - vi har allerede filer.
3. Si ifra til Claude at repoet er klart (gi navnet/URL-en), så pusher Claude koden opp.
4. Første gang du pusher fra denne PC-en vil Windows sannsynligvis åpne en nettleser der du logger inn på GitHub - fullfør den innloggingen.
5. Gå til repoet på GitHub → **Settings → Pages** → under "Build and deployment", velg branch `main` og mappe `/ (root)` → **Save**.
6. Etter ca. 1 minutt får du en lenke som `https://dittbrukernavn.github.io/treningslogger/` - dette er appen deres!
7. Husk å legge dette domenet til i Firebase (steg 6) før innlogging vil fungere der.

## 9. Installer på telefonene

**Android (Chrome):**
1. Åpne GitHub Pages-lenken i Chrome.
2. Logg inn med Google.
3. Trykk meny (⋮) → **"Legg til på startskjermen"** / "Installer app".

**iPhone (Safari):**
1. Åpne lenken i **Safari** (må være Safari, ikke Chrome, for at "legg til"-funksjonen skal virke).
2. Logg inn med Google.
3. Trykk Del-ikonet (firkant med pil opp) → **"Legg til på Hjem-skjerm"**.

Gjenta på begge telefoner (din og sønnen din, med hver deres Google-konto).

---

## Fremtidige oppdateringer

Når vi gjør endringer i appen senere, trenger du bare å si ifra til Claude - koden pushes til GitHub, og GitHub Pages oppdaterer appen automatisk innen ca. ett minutt. Dere trenger ikke installere appen på nytt; den oppdaterer seg selv i bakgrunnen (service worker) neste gang appen åpnes med nett.

## Feilsøking

- **"Firebase er ikke satt opp ennå"-melding ved innlogging:** `js/firebase-config.js` er ikke fylt ut riktig (steg 5).
- **"Denne kontoen har ikke tilgang"-melding:** e-posten som logget inn står ikke i `ALLOWED_EMAILS` (steg 5) og/eller i Firestore-reglene (steg 4).
- **Innlogging gjør ingenting / feil om domene:** domenet mangler i Authorized domains (steg 6).
- **Data vises ikke på den andre telefonen:** sjekk at begge er innlogget med en konto som står i `ALLOWED_EMAILS`, og at begge har nett (eller vent til nettet er tilbake - Firestore synker automatisk).

## Idéer til senere (ikke bygget i v1)

- Bildeopplasting til hockeykortet (spillerbilde).
- Sammenligning av innsats mellom sesonger (år-for-år-graf).
- PDF-eksport av hockeykortet i sponsorvennlig format.
- Push-varsler/påminnelser om å logge økten.
