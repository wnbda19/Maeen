import config from "../../../collection/profiles.json";
export const profiles = config;
export interface Draft {
  profileId: string;
  signerId: string;
  sessionId: string;
  wordId: string;
  repetition: number;
  take: number;
  consent: boolean;
  consentRef: string;
}
export interface Recording extends Draft {
  clipId: string;
  file: string;
  source: "first-party";
  captureType: "real-camera";
  mirrored: false;
  durationSeconds: number;
  durationMethod: "monotonic-clock";
  createdAt: string;
  mimeType: string;
  condition: string;
  speed: string;
  distanceMetres: number;
  schemaVersion: string;
  officialTermId: string | null;
  officialReference: string | null;
  qc: {
    accepted: boolean;
    languageReviewer: string;
    technicalReviewer: string;
    reason: string;
  };
}
export function validateDraft(d: Draft, seconds?: number) {
  const p = profiles.profiles.find((p) => p.id === d.profileId);
  if (
    !p ||
    !p.signers.includes(d.signerId) ||
    !/^C\d{2}$/.test(d.sessionId) ||
    !p.wordIds.concat(["N000", "N001"]).includes(d.wordId)
  )
    throw Error("Choose a valid profile, signer, session and target.");
  if (!d.consent || !d.consentRef.trim() || d.consentRef.length > 80)
    throw Error("Verify written consent and enter its anonymous reference.");
  const limit = d.wordId.startsWith("N")
    ? p.negativeRepetitions
    : p.repetitions;
  if (
    !Number.isInteger(d.repetition) ||
    d.repetition < 1 ||
    d.repetition > limit ||
    !Number.isInteger(d.take) ||
    d.take < 1 ||
    d.take > 99
  )
    throw Error("Repetition or take is outside the profile.");
  if (
    seconds !== undefined &&
    (!Number.isFinite(seconds) || seconds < 3 || seconds > 10.25)
  )
    throw Error(
      "Clip must be 3–10 seconds. Record a complete sign with neutral lead-in and return.",
    );
}
export function clipName(d: Draft, extension: string) {
  if (!["webm", "mp4"].includes(extension))
    throw Error("Unsupported recording format");
  return `${d.signerId}_${d.wordId}_${d.sessionId}_R${String(d.repetition).padStart(2, "0")}_T${String(d.take).padStart(2, "0")}.${extension}`;
}
export function collectionProgress(
  rows: Array<Draft & { qc?: { accepted: boolean } }>,
  profileId: string,
) {
  const p = profiles.profiles.find((p) => p.id === profileId)!;
  const eligible = rows.filter(
    (r) =>
      r.profileId === profileId &&
      p.wordIds.includes(r.wordId) &&
      p.signers.includes(r.signerId) &&
      r.repetition >= 1 &&
      r.repetition <= p.repetitions,
  );
  const key = (r: Draft) => `${r.signerId}/${r.wordId}/${r.repetition}`;
  const recorded = new Set(eligible.map(key)).size,
    accepted = new Set(eligible.filter((r) => r.qc?.accepted).map(key)).size;
  return {
    recorded,
    accepted,
    target: p.positiveTarget,
    remaining: p.positiveTarget - accepted,
  };
}
export interface SavedClip {
  key: string;
  metadata: Recording;
  blob: Blob;
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("maeen-internal-collection-v2", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("clips", { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function saveClip(clip: SavedClip) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("clips", "readwrite");
      tx.objectStore("clips").add(clip);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () =>
        reject(tx.error || Error("Storage transaction aborted"));
    });
  } finally {
    db.close();
  }
}
// Cursor values are immediately reduced to metadata; do not retain every video in React memory.
export async function listClips(): Promise<
  Array<{ key: string; metadata: Recording }>
> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const result: Array<{ key: string; metadata: Recording }> = [];
      const tx = db.transaction("clips");
      const request = tx.objectStore("clips").openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          result.push({
            key: String(cursor.key),
            metadata: cursor.value.metadata,
          });
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function readClip(key: string): Promise<SavedClip> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction("clips").objectStore("clips").get(key);
      req.onsuccess = () =>
        req.result ? resolve(req.result) : reject(Error("Clip not found"));
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
