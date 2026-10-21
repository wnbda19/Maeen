import type { Strings } from "../../localization/strings";
import { Icon } from "../../components/Icon";
import { SpeechButton } from "../../components/SpeechButton";
export default function WordMode({ t }: { t: Strings }) {
  return (
    <>
      <p className="state-badge" data-model-state="dataset-required">
        {t.datasetRequired}
      </p>
      <p className="reference-notice" role="status">
        {t.wordUnavailable}
      </p>
      <div className="translator-layout word-workspace">
        <section className="camera-workspace" aria-label={t.wordCamera}>
          <div className="media-toolbar">
            <span>
              <Icon name="camera" />
              {t.wordCamera}
            </span>
            <span>{t.futureState}</span>
          </div>
          <div className="word-camera-empty">
            <Icon name="hand" />
            <h2>{t.wordCamera}</h2>
            <p>{t.wordCameraHelp}</p>
          </div>
        </section>
        <div className="translator-output">
          <section className="recognition-result">
            <h2>{t.wordOutput}</h2>
            <div className="word-result" aria-label={t.noWords}>
              —
            </div>
            <p>{t.noWords}</p>
          </section>
          <section className="text-output">
            <h2>{t.wordSpeech}</h2>
            <SpeechButton text="" t={t} />
          </section>
        </div>
      </div>
      <div className="word-detail-grid">
        <section className="panel">
          <div className="output-heading">
            <h2>{t.wordHistory}</h2>
            <button className="text-button" disabled>
              {t.resetWords}
            </button>
          </div>
          <p>{t.noWords}</p>
        </section>
        <section className="panel">
          <h2>{t.vocabulary}</h2>
          <p>{t.noVocabulary}</p>
        </section>
      </div>
    </>
  );
}
