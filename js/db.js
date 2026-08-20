// Alt av lesing/skriving mot Firestore samles her.
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  enableIndexedDbPersistence,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { app } from "./firebase-init.js";

export const db = getFirestore(app);

// Gjør at appen fungerer offline (f.eks. på isbanen uten nett) - Firestore
// mellomlagrer lokalt og synker automatisk når nettet er tilbake.
// Kan feile stille i noen nettlesere/faner (f.eks. flere faner åpne samtidig) -
// appen fungerer fint uten, bare uten offline-støtte i akkurat det tilfellet.
enableIndexedDbPersistence(db).catch((err) => {
  console.warn("Offline-lagring ikke aktivert:", err.code);
});

const SESSIONS = "sessions";
const USERS = "users";

export function sumBlocks(blocks) {
  return (blocks || []).reduce((sum, b) => sum + (Number(b.minutes) || 0), 0);
}

export async function addSession({ date, blocks, user }) {
  const cleanBlocks = (blocks || [])
    .filter((b) => b.category && Number(b.minutes) > 0)
    .map((b) => ({
      category: b.category,
      minutes: Number(b.minutes),
      note: (b.note || "").trim(),
    }));

  if (cleanBlocks.length === 0) {
    throw new Error("Legg til minst én kategori med minutter før du lagrer.");
  }

  const payload = {
    date, // "YYYY-MM-DD"
    blocks: cleanBlocks,
    totalMinutes: sumBlocks(cleanBlocks),
    loggedByUid: user.uid,
    loggedByName: user.displayName || user.email,
    createdAt: serverTimestamp(),
  };

  return addDoc(collection(db, SESSIONS), payload);
}

export async function updateSession(id, { date, blocks }) {
  const cleanBlocks = (blocks || [])
    .filter((b) => b.category && Number(b.minutes) > 0)
    .map((b) => ({
      category: b.category,
      minutes: Number(b.minutes),
      note: (b.note || "").trim(),
    }));

  if (cleanBlocks.length === 0) {
    throw new Error("Legg til minst én kategori med minutter før du lagrer.");
  }

  return updateDoc(doc(db, SESSIONS, id), {
    date,
    blocks: cleanBlocks,
    totalMinutes: sumBlocks(cleanBlocks),
  });
}

export function deleteSession(id) {
  return deleteDoc(doc(db, SESSIONS, id));
}

export async function getSession(id) {
  const snap = await getDoc(doc(db, SESSIONS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Lytter i sanntid på alle økter, sortert nyeste dato først.
// Returnerer en "unsubscribe"-funksjon.
export function listenSessions(callback, onError) {
  const q = query(collection(db, SESSIONS), orderBy("date", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const sessions = [];
      snap.forEach((d) => sessions.push({ id: d.id, ...d.data() }));
      callback(sessions);
    },
    (err) => {
      console.error("Feil ved lytting på økter:", err);
      if (onError) onError(err);
    }
  );
}

export async function upsertUserProfile(user) {
  try {
    const ref = doc(db, USERS, user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: user.displayName || "",
        email: user.email || "",
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    // Ikke kritisk for at appen skal virke - bare logg.
    console.warn("Klarte ikke lagre brukerprofil:", err);
  }
}
