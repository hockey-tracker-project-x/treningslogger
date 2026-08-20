# 🏒 Treningslogger

En enkel, mobilvennlig treningsdagbok for hockey - bygget for å logge treningstimer, følge ferdighetsutvikling gjennom et gamifisert "hockeykort", og eksportere data til Excel (bl.a. for å dokumentere målrettet innsats overfor sponsorer).

Bygget som en ren HTML/CSS/JavaScript-app (ingen bygge-verktøy nødvendig) som kan installeres som en app på hjemskjermen på både iPhone og Android (PWA), med Firebase som backend for innlogging og delt, sanntidssynkronisert lagring.

## Kom i gang

👉 Se **[SETUP.md](./SETUP.md)** for steg-for-steg-instruksjoner (Firebase-oppsett, publisering på GitHub Pages, installasjon på telefon).

## Funksjoner

- **Logg økt**: velg dato (standard i dag), kombiner flere treningskategorier i samme økt, i 15-minutters steg.
- **Dashboard**: hockeykort med 6 ferdigheter (10-99, maks ved 5 000 timer i kategorien), fordeling av treningstid, streak-teller, merker/milepæler og siste økter.
- **Historikk**: full liste over alle økter med filter, samt rediger/slett.
- **Eksport**: last ned all data som `.xlsx` (rådata + sammendrag per kategori/måned).
- **To brukere**: du og sønnen din logger inn hver for dere med Google, men deler samme treningslogg.
- **Offline-støtte**: fungerer uten nett (f.eks. på isbanen) og synker automatisk når nettet er tilbake.

## Kategorier og tilhørende ferdighet

| Kategori | Ferdighet |
|---|---|
| Barmark | Fysikk |
| Skøytegåing | Skøyteferdigheter |
| Spill/drill-øvelser | Hockey IQ |
| Kølleteknikk | Soft Hands |
| Rehab/stretching | Robust |
| Skuddtrening | Skudd |
| Annet | *(telles i totaltimer, påvirker ingen ferdighet)* |

Skala og kategorier kan justeres i [`js/config.js`](./js/config.js).

## Teknisk

- Ren HTML/CSS/JavaScript (ES-moduler), ingen npm/byggesteg.
- [Firebase](https://firebase.google.com) (Authentication + Firestore) lastet via CDN.
- [SheetJS](https://sheetjs.com) (via CDN) for Excel-eksport.
- Hostes gratis på GitHub Pages.

## Prosjektstruktur

```
index.html          Dashboard (forside)
login.html          Innlogging (Google)
logg.html            Registrere/redigere økt
historikk.html        Liste over alle økter
eksport.html           Eksport til Excel
css/styles.css          Felles styling
js/                      All applikasjonslogikk (se filnavn - hver fil har ett ansvarsområde)
icons/                    App-ikoner (PWA)
manifest.json + service-worker.js   PWA-oppsett
```
