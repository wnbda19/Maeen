import { useState } from "react";
import { phrases } from "./phrases";
import { cancelSpeech } from "../../services/speech/speak";
import { SpeechControls } from "../../components/SpeechControls";
import { PageHeading } from "../../components/PageHeading";
import { Icon } from "../../components/Icon";
import type { Strings } from "../../localization/strings";
export default function CommunicationView({
  t,
  lang,
}: {
  t: Strings;
  lang: "ar" | "en";
}) {
  const [search, setSearch] = useState(""),
    [message, setMessage] = useState("");
  const filtered = phrases.filter((p) =>
    `${p.ar} ${p.en}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow={t.communicationEyebrow}
        title={t.dictionaryTitle}
        description={t.dictionaryInfo}
      />
      <div className="communication-layout">
        <section className="phrase-browser" aria-label={t.search}>
          <label htmlFor="phrase-search">{t.search}</label>
          <div className="search-field">
            <Icon name="search" />
            <input
              id="phrase-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button aria-label={t.clearSearch} onClick={() => setSearch("")}>
                <Icon name="close" />
              </button>
            )}
          </div>
          <div className="phrase-count">
            <span>{t.phraseCount}</span>
            <span>
              {filtered.length} / {phrases.length}
            </span>
          </div>
          <div className="phrase-list">
            {filtered.map((p) => (
              <button
                key={p.ar}
                aria-pressed={message === p.ar}
                onClick={() => setMessage(p.ar)}
              >
                <Icon name="message" />
                <span className="phrase-content">
                  <span lang="ar" dir="rtl">
                    {p.ar}
                  </span>
                  {lang === "en" && (
                    <>
                      {" "}
                      <small lang="en" dir="ltr">
                        {p.en}
                      </small>
                    </>
                  )}
                </span>
                {message === p.ar && (
                  <Icon name="check" className="phrase-choice" />
                )}
              </button>
            ))}
          </div>
          {!filtered.length && (
            <p className="status" role="status">
              {t.noResults}
            </p>
          )}
        </section>
        <section className="phrase-editor">
          <div className="output-heading">
            <label htmlFor="message">{t.message}</label>
            <Icon name="message" />
          </div>
          <p className="editor-empty-hint" id="message-help">
            {t.writeMessage}
          </p>
          <textarea
            id="message"
            aria-describedby="message-help"
            dir="rtl"
            lang="ar"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="…"
          />
          <div className="output-edit">
            <span className="state-badge">AR</span>
            <button
              className="text-button"
              disabled={!message}
              onClick={() => {
                cancelSpeech();
                setMessage("");
              }}
            >
              <Icon name="trash" />
              {t.clear}
            </button>
          </div>
          <SpeechControls text={message} t={t} />
          <p className="muted">{t.speakHelp}</p>
        </section>
      </div>
      <div className="tool-footnote">
        <Icon name="shield" />
        <p>{t.privacyDetail}</p>
      </div>
    </>
  );
}
