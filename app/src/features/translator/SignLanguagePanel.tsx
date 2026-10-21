import {
  signLanguages,
  type SignLanguageId,
  type SignLanguage,
} from "../../services/signs/registry";
export function SignLanguagePanel({
  language,
  onChange,
  arabic,
}: {
  language: SignLanguage;
  onChange: (id: SignLanguageId) => void;
  arabic: boolean;
}) {
  const tr = (ar: string, en: string) => (arabic ? ar : en);
  return (
    <section className="panel sign-language-panel">
      <label htmlFor="sign-language">
        {tr("لغة الإشارة", "Sign Language")}
      </label>
      <select
        id="sign-language"
        value={language.id}
        onChange={(e) => onChange(e.target.value as SignLanguageId)}
      >
        {signLanguages.map((l) => (
          <option key={l.id} value={l.id}>
            {l.displayName}
          </option>
        ))}
      </select>
      <p>
        {tr(
          "لغات إشارة مستقلة؛ تغيير اللغة يوقف الكاميرا ويمسح النص والأدلة السابقة.",
          "Independent sign languages; changing language stops the camera and clears text and recognition evidence.",
        )}
      </p>
      <dl className="sign-capabilities">
        <div>
          <dt>{tr("الحروف", "Letters")}</dt>
          <dd>
            {language.id === "arsl"
              ? tr(
                  "37 فئة بالنموذج الأصلي؛ الدقة غير متحققة",
                  "37 legacy model classes; accuracy unverified",
                )
              : language.id === "asl"
                ? tr(
                    "24 حرفاً ثابتاً — تجريبي؛ J و Z غير مدعومين",
                    "24 static letters — experimental; J and Z unsupported",
                  )
                : tr("غير متاح", "Unavailable")}
          </dd>
        </div>
        <div>
          <dt>{tr("الكلمات", "Words")}</dt>
          <dd>
            {language.id === "arsl"
              ? tr(
                  "غير منفذ — بانتظار بيانات حقيقية متعددة المؤدين",
                  "Not Implemented — waiting for real multi-signer data",
                )
              : tr("نموذج غير متاح", "Model unavailable")}
          </dd>
        </div>
        <div>
          <dt>{tr("حالة النموذج", "Model status")}</dt>
          <dd data-language-status={language.id}>
            {language.id === "arsl"
              ? tr(
                  "النموذج الأصلي محفوظ؛ تقييم الدقة غير متاح",
                  "Legacy model preserved; accuracy unverified",
                )
              : language.id === "asl"
                ? tr(
                    "تجريبي؛ دقة صور من مصدر منفصل 63.1% عند كشف اليد؛ ليس تقييماً مستقلاً حسب المؤدي",
                    "Experimental; separate-source image accuracy 63.1% when a hand is detected; not signer-independent",
                  )
                : tr("بحث / نموذج غير متاح", "Research / Model unavailable")}
          </dd>
        </div>
      </dl>
      {language.letters.supported && (
        <details>
          <summary>
            {tr("فئات الحروف المدعومة", "Supported letter classes")}
          </summary>
          <p dir={language.direction} lang={language.textLanguage}>
            {language.vocabulary.letters.join(" · ")}
          </p>
        </details>
      )}
      {language.id === "asl" && (
        <p className="reference-notice">
          {tr(
            "لا يتعرف هذا النموذج على الكلمات أو الحركات J/Z. لا توجد نتيجة موثوقة للكاميرا الحية بعد. قد يقبل أشكال يد غير معروفة بثقة عالية.",
            "This model does not recognize words or J/Z motion. Live webcam reliability is unverified. Unseen handshapes may receive high confidence.",
          )}
        </p>
      )}
    </section>
  );
}
export function UnsupportedSignMode({
  language,
  arabic,
  mode,
}: {
  language: SignLanguage;
  arabic: boolean;
  mode: "letters" | "words" | "learn";
}) {
  const tr = (ar: string, en: string) => (arabic ? ar : en);
  return (
    <section className="panel" data-model-state="unavailable" role="status">
      <h2>{language.displayName}</h2>
      <p>{tr("بحث / نموذج غير متاح", "Research / Model unavailable")}</p>
      <p>
        {mode === "learn"
          ? tr(
              "لا توجد مراجع تعليمية موثقة مدمجة لهذه اللغة.",
              "No verified learning references are integrated for this language.",
            )
          : tr(
              "التعرف في هذا الوضع غير منفذ. لا يتم تشغيل الكاميرا أو إصدار تنبؤات.",
              "Recognition in this mode is not implemented. Camera capture and predictions remain off.",
            )}
      </p>
      <h3>{tr("المفردات المدعومة", "Supported vocabulary")}</h3>
      <p>
        {tr(
          "لا توجد مفردات تعرف مدعومة في هذا الوضع.",
          "No recognition vocabulary is supported in this mode.",
        )}
      </p>
    </section>
  );
}
