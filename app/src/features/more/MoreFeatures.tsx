import type { Strings } from "../../localization/strings";
import { PageHeading } from "../../components/PageHeading";
import { catalog } from "./catalog";
export default function MoreFeatures({
  t,
  lang,
}: {
  t: Strings;
  lang: "ar" | "en";
}) {
  return (
    <>
      <PageHeading
        eyebrow={t.more}
        title={t.moreTitle}
        description={t.moreInfo}
      />
      <div className="feature-directory">
        {catalog[lang].map((feature) => (
          <details key={feature.title} className="feature-entry">
            <summary>
              <strong>{feature.title}</strong>
              <span className="state-badge">
                {feature.state === "available"
                  ? t.realState
                  : feature.state === "partial"
                    ? t.partialState
                    : t.futureState}
              </span>
            </summary>
            <div>
              <p>{feature.description}</p>
              {feature.route && (
                <a className="feature-tool-link" href={`#${feature.route}`}>
                  {t.openTool}
                </a>
              )}
            </div>
          </details>
        ))}
      </div>
      <section className="context-section">
        <h2>{t.contextTitle}</h2>
        <p className="muted">{t.contextInfo}</p>
        <ul className="context-list" aria-label={t.contextTitle}>
          {t.contexts.map((context) => (
            <li key={context}>{context}</li>
          ))}
        </ul>
        <a className="feature-tool-link" href="#dictionary">
          {t.dictionary}
        </a>
      </section>
      <section className="context-section">
        <h2>{lang === "ar" ? "فريق مُعِين" : "MAEEN team"}</h2>
        <p>
          {lang === "ar"
            ? "عمر سلمان الشمري · ضي شايع الحربي"
            : "Omar Salman Alshammari · Dhay Shaye Alharbi"}
        </p>
        <p className="muted">
          {lang === "ar"
            ? "روابط التواصل المنشورة في الموقع الأصلي؛ تفتح تطبيق الاتصال على جهازك."
            : "Contact links published on the original site; they open your device’s calling app."}
        </p>
        <div className="controls">
          <a className="feature-tool-link" href="tel:0553008966">
            {lang === "ar" ? "اتصال بعمر" : "Call Omar"}
          </a>
          <a className="feature-tool-link" href="tel:0559787161">
            {lang === "ar" ? "اتصال بضي" : "Call Dhay"}
          </a>
        </div>
      </section>
    </>
  );
}
