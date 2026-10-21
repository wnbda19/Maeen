import { useEffect, useRef, useState } from "react";
import { MediaSession } from "../services/media/session";
import {
  profiles,
  validateDraft,
  clipName,
  collectionProgress,
  listClips,
  saveClip,
  readClip,
  download,
  type Draft,
  type Recording,
} from "./recording";
export default function Collector() {
  const [draft, setDraft] = useState<Draft>({
    profileId: "reference25",
    signerId: "S001",
    sessionId: "C01",
    wordId: "W101",
    repetition: 1,
    take: 1,
    consent: false,
    consentRef: "",
  });
  const [items, setItems] = useState<Awaited<ReturnType<typeof listClips>>>([]),
    [state, setState] = useState("idle"),
    [message, setMessage] = useState("Camera is off."),
    [elapsed, setElapsed] = useState(0),
    [condition, setCondition] = useState("bright-plain"),
    [speed, setSpeed] = useState("comfortable"),
    [distance, setDistance] = useState(1.5),
    [selected, setSelected] = useState("");
  const video = useRef<HTMLVideoElement>(null),
    session = useRef(new MediaSession()),
    recorder = useRef<MediaRecorder | null>(null),
    cancelled = useRef(false),
    mounted = useRef(true),
    requestId = useRef(0),
    stoppedAt = useRef<number | null>(null),
    locked = useRef(false),
    timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const busy =
    state === "starting" || state === "recording" || state === "saving";
  const profile = profiles.profiles.find((p) => p.id === draft.profileId)!;
  const word = profiles.words.find((w) => w.id === draft.wordId);
  const progress = collectionProgress(
    items.map((i) => i.metadata),
    draft.profileId,
  );
  const [replay, setReplay] = useState("");
  const refresh = async () => {
    const list = await listClips();
    if (mounted.current) setItems(list);
  };
  function end() {
    if (recorder.current?.state === "recording") {
      stoppedAt.current = performance.now();
      recorder.current.stop();
    }
    session.current.stop();
    clearInterval(timer.current);
    if (video.current) video.current.srcObject = null;
  }
  useEffect(() => {
    mounted.current = true;
    refresh().catch(() =>
      setMessage(
        "Local storage unavailable. Collection is disabled until storage works.",
      ),
    );
    return () => {
      mounted.current = false;
      cancelled.current = true;
      requestId.current++;
      end();
    };
  }, []);
  useEffect(() => {
    if (!draft.consent && busy) {
      cancelled.current = true;
      requestId.current++;
      locked.current = false;
      end();
      setState("idle");
      setMessage("Consent unchecked: recording cancelled and camera stopped.");
    }
  }, [draft.consent]);
  useEffect(() => {
    let active = true,
      url = "";
    setReplay("");
    if (selected)
      (async () => {
        try {
          const clip = await readClip(selected);
          if (clip && active) {
            url = URL.createObjectURL(clip.blob);
            setReplay(url);
          }
        } catch {
          if (active)
            setMessage("Could not open saved preview; check local storage.");
        }
      })();
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [selected]);
  function change(key: keyof Draft, value: string | number | boolean) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  async function start() {
    if (locked.current) return;
    locked.current = true;
    const token = ++requestId.current;
    try {
      validateDraft(draft);
      if (!Number.isFinite(distance) || distance < 1 || distance > 3)
        throw Error("Set a measured camera distance between 1 and 3 metres.");
      if (typeof MediaRecorder === "undefined")
        throw Error("This browser does not support recording.");
      setState("starting");
      cancelled.current = false;
      await listClips(); // Confirm storage before asking for the camera.
      if (token !== requestId.current || !mounted.current) return;
      const takes = items
        .filter(
          (i) =>
            i.metadata.profileId === draft.profileId &&
            i.metadata.signerId === draft.signerId &&
            i.metadata.sessionId === draft.sessionId &&
            i.metadata.wordId === draft.wordId &&
            i.metadata.repetition === draft.repetition,
        )
        .map((i) => i.metadata.take);
      const snapshot = { ...draft, take: Math.max(0, ...takes) + 1 };
      validateDraft(snapshot);
      setMessage("Requesting camera…");
      const stream = await session.current.start({
        audio: false,
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
          facingMode: "user",
        },
      });
      if (
        !stream ||
        cancelled.current ||
        !mounted.current ||
        token !== requestId.current
      ) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      if (video.current) video.current.srcObject = stream;
      const mime = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/mp4",
      ].find((t) => MediaRecorder.isTypeSupported(t));
      if (!mime) throw Error("No supported WebM/MP4 recording codec.");
      const mr = new MediaRecorder(stream, { mimeType: mime });
      recorder.current = mr;
      const chunks: BlobPart[] = [];
      const began = performance.now();
      stoppedAt.current = null;
      mr.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      mr.onerror = () => {
        cancelled.current = true;
        locked.current = false;
        end();
        setState("idle");
        setMessage("Recording failed. Nothing saved; retry.");
      };
      mr.onstop = async () => {
        // A cancelled recorder may finish flushing after a newer session starts.
        // Its callback must not stop the new stream or save the old capture.
        if (token !== requestId.current || !mounted.current) return;
        const seconds =
          ((stoppedAt.current ?? performance.now()) - began) / 1000;
        session.current.stop();
        clearInterval(timer.current);
        if (video.current) video.current.srcObject = null;
        if (cancelled.current || !mounted.current) {
          locked.current = false;
          return;
        }
        setState("saving");
        try {
          validateDraft(snapshot, seconds);
          const blob = new Blob(chunks, { type: mr.mimeType });
          if (!blob.size) throw Error("Empty recording; nothing saved.");
          const extension = mr.mimeType.includes("mp4") ? "mp4" : "webm";
          const filename = clipName(snapshot, extension),
            clipId = filename.replace(/\.(mp4|webm)$/, "");
          const metadata: Recording = {
            ...snapshot,
            clipId,
            file: `raw/${snapshot.signerId}/${snapshot.sessionId}/${snapshot.wordId}/${filename}`,
            source: "first-party",
            captureType: "real-camera",
            mirrored: false,
            durationSeconds: seconds,
            durationMethod: "monotonic-clock",
            createdAt: new Date().toISOString(),
            mimeType: mr.mimeType,
            condition,
            speed,
            distanceMetres: distance,
            schemaVersion: "maeen-collection-v2",
            officialTermId: word?.officialTermId || null,
            officialReference: word?.officialUrl || null,
            qc: {
              accepted: false,
              languageReviewer: "",
              technicalReviewer: "",
              reason: "awaiting-decoded-duration-and-linguistic-review",
            },
          };
          const key = `${snapshot.profileId}/${clipId}`;
          await saveClip({ key, metadata, blob });
          await refresh();
          if (mounted.current) {
            setSelected(key);
            setMessage(
              `Saved locally: ${filename}. Pending QC; export video and metadata.`,
            );
            setDraft((d) => ({
              ...d,
              take: snapshot.take,
              repetition: Math.min(
                d.repetition + 1,
                d.wordId.startsWith("N")
                  ? profile.negativeRepetitions
                  : profile.repetitions,
              ),
            }));
          }
        } catch (e) {
          if (mounted.current) setMessage((e as Error).message);
        } finally {
          locked.current = false;
          if (mounted.current) setState("idle");
        }
      };
      mr.start(250);
      setElapsed(0);
      setState("recording");
      setMessage(
        "Recording — perform one complete sign, then return to neutral.",
      );
      timer.current = setInterval(() => {
        const seconds = (performance.now() - began) / 1000;
        setElapsed(seconds);
        if (seconds >= 9.8) end();
      }, 100);
    } catch (e) {
      locked.current = false;
      end();
      if (mounted.current) {
        setState("idle");
        setMessage((e as Error).message);
      }
    }
  }
  async function exportClip(kind: "video" | "metadata") {
    try {
      const clip = await readClip(selected);
      download(
        kind === "video"
          ? clip.blob
          : new Blob([JSON.stringify(clip.metadata, null, 2)], {
              type: "application/json",
            }),
        kind === "video"
          ? clip.metadata.file.split("/").pop()!
          : clip.metadata.clipId + ".json",
      );
      setMessage(
        "Download requested. Check the saved file before closing this browser.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <main className="collector">
      <header>
        <span>مُعِين · MAEEN</span>
        <p>Internal collection · local storage only</p>
      </header>
      <h1>Record Saudi sign-language samples</h1>
      <p>
        Official clips are linguistic references only. Record consenting
        participants; never import library footage. No uploads, microphone
        recording or model training.
      </p>
      <section className="collection-stats" aria-label="Collection progress">
        <strong>
          {progress.recorded} / {progress.target.toLocaleString()} slots
          recorded locally
        </strong>
        <span>
          {progress.accepted} QC-approved locally ·{" "}
          {progress.remaining.toLocaleString()} positive recordings still
          required after QC
        </span>
        <span>
          Also required: {profile.negativeTarget} No Sign / Unknown recordings.
          Retakes do not fill extra slots.
        </span>
      </section>
      <div className="collection-grid">
        <section>
          <fieldset disabled={busy}>
            <legend>Anonymous session and target</legend>
            <label>
              Collection profile
              <select
                value={draft.profileId}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    profileId: e.target.value,
                    signerId: "S001",
                    wordId: "W101",
                    repetition: 1,
                    take: 1,
                    consent: false,
                    consentRef: "",
                  })
                }
              >
                {profiles.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Signer code
              <select
                value={draft.signerId}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    signerId: e.target.value,
                    consent: false,
                    consentRef: "",
                    repetition: 1,
                  })
                }
              >
                {profile.signers.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Session code
              <input
                value={draft.sessionId}
                pattern="C[0-9]{2}"
                maxLength={3}
                onChange={(e) => change("sessionId", e.target.value)}
              />
            </label>
            <label>
              Target term
              <select
                value={draft.wordId}
                onChange={(e) =>
                  setDraft({ ...draft, wordId: e.target.value, repetition: 1 })
                }
              >
                {profiles.words
                  .filter((w) => profile.wordIds.includes(w.id))
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.ar} · {w.en}
                    </option>
                  ))}
                <option value="N000">No Sign · neutral/rest</option>
                <option value="N001">
                  Unknown · reviewed out-of-vocabulary signing
                </option>
              </select>
            </label>
            <label>
              Repetition (global per signer/term)
              <input
                type="number"
                min={1}
                max={draft.wordId.startsWith("N") ? 5 : 15}
                value={draft.repetition}
                onChange={(e) => change("repetition", Number(e.target.value))}
              />
            </label>
            <label>
              Condition
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                {[
                  "bright-plain",
                  "soft-plain",
                  "bright-textured",
                  "soft-textured",
                  "alternate-room",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Natural signing speed
              <select value={speed} onChange={(e) => setSpeed(e.target.value)}>
                {["comfortable", "slower-natural", "brisk-natural"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Measured camera distance (metres)
              <input
                type="number"
                min={1}
                max={3}
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
              />
            </label>
            <label>
              Written-consent reference
              <input
                value={draft.consentRef}
                maxLength={80}
                onChange={(e) => change("consentRef", e.target.value)}
                placeholder="C-S001-v2 — no names"
              />
            </label>
          </fieldset>
          <label className="consent">
            <input
              type="checkbox"
              disabled={state === "saving"}
              checked={draft.consent}
              onChange={(e) => change("consent", e.target.checked)}
            />
            I verified active written consent for recording, ML training and
            trained-model distribution. Unchecking cancels capture.
          </label>
        </section>
        <section>
          <h2 dir="rtl">{word?.ar || draft.wordId}</h2>
          {word ? (
            <a
              href={word.officialUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Open official linguistic reference ↗ · {word.officialTermId}
            </a>
          ) : (
            <p>
              Use only reviewed real negative examples; never
              synthetic/duplicated footage.
            </p>
          )}
          <video
            ref={video}
            autoPlay
            muted
            playsInline
            aria-label="Local unmirrored camera preview"
          />
          <p>
            Keep head, face, both hands, elbows and upper hips inside frame. No
            audio. 0.75 seconds neutral → complete sign → 0.75 seconds neutral.
          </p>
          <p aria-live="off">{elapsed.toFixed(1)} s · valid capture 3–10 s</p>
          <div className="collection-actions">
            <button
              disabled={busy || !draft.consent || !draft.consentRef}
              onClick={start}
            >
              Start recording
            </button>
            <button disabled={state !== "recording"} onClick={end}>
              Stop and save locally
            </button>
          </div>
          <p>
            {
              new Set(
                items
                  .filter(
                    (i) =>
                      i.metadata.profileId === draft.profileId &&
                      i.metadata.signerId === draft.signerId &&
                      i.metadata.wordId === draft.wordId,
                  )
                  .map((i) => i.metadata.repetition),
              ).size
            }{" "}
            /{" "}
            {draft.wordId.startsWith("N")
              ? profile.negativeRepetitions
              : profile.repetitions}{" "}
            recorded slots for this signer and target.
          </p>
          <p role="status" aria-live="polite">
            {message}
          </p>
        </section>
      </div>
      <section>
        <h2>Review and export</h2>
        <p>
          Browser storage can be cleared or evicted. Export each video and its
          matching JSON to a private folder. These counts cover this browser
          only; use the offline progress audit for the combined dataset.
          Duration here uses elapsed recording time; decoded video duration and
          linguistic QC are checked offline.
        </p>
        <label>
          Saved clip
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Choose a recording</option>
            {items
              .filter((i) => i.metadata.profileId === draft.profileId)
              .map((i) => (
                <option key={i.key} value={i.key}>
                  {i.metadata.clipId} · {i.metadata.durationSeconds.toFixed(1)}s
                  · pending QC
                </option>
              ))}
          </select>
        </label>
        {replay && (
          <video
            src={replay}
            controls
            playsInline
            aria-label="Saved local recording for review"
          />
        )}
        <div className="collection-actions">
          <button
            disabled={!selected || busy}
            onClick={() => exportClip("video")}
          >
            Download video
          </button>
          <button
            disabled={!selected || busy}
            onClick={() => exportClip("metadata")}
          >
            Download metadata JSON
          </button>
          <button
            disabled={!items.length || busy}
            onClick={() =>
              download(
                new Blob(
                  [items.map((i) => JSON.stringify(i.metadata)).join("\n")],
                  { type: "application/x-ndjson" },
                ),
                "recordings.jsonl",
              )
            }
          >
            Download metadata index
          </button>
        </div>
      </section>
    </main>
  );
}
