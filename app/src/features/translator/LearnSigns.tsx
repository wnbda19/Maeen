import { useState } from "react";
import labels from "../../../../models/arsl-labels.json";
import type { Strings } from "../../localization/strings";
export default function LearnSigns({ t }: { t: Strings }) {
  const [selected, setSelected] = useState(labels.labels[0]);
  return (
    <section className="learn-workspace">
      <div className="reference-notice">
        <p>{t.chartMissing}</p>
        <p className="muted">{t.labelNote}</p>
      </div>
      <div className="alphabet-layout">
        <ul className="alphabet-gallery" aria-label={t.gallery} dir="rtl">
          {labels.labels.map((label) => (
            <li key={label}>
              <button
                lang="ar"
                aria-label={`${t.inspect} ${label}`}
                aria-pressed={selected === label}
                onClick={() => setSelected(label)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        <section className="alphabet-detail" aria-label={t.selectedLabel}>
          <p role="status" aria-atomic="true">
            {t.selectedLabel} <bdi lang="ar">{selected}</bdi>
          </p>
          <strong lang="ar" dir="rtl" className="alphabet-character">
            {selected}
          </strong>
          <p>{t.poseMissing}</p>
        </section>
      </div>
    </section>
  );
}
