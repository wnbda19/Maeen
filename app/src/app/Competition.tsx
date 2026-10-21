import { useState } from "react";
/** Presentation guidance only. No device, model or prediction access. */
export function Competition({
  arabic,
  information,
}: {
  arabic: boolean;
  information: boolean;
}) {
  const [active, setActive] = useState(false);
  const tr = (ar: string, en: string) => (arabic ? ar : en);
  return (
    <>
      {active && (
        <section
          className="context-section competition-guide"
          aria-label={tr("دليل عرض المسابقة", "Competition demo guide")}
        >
          <h2>{tr("دليل العرض الحقيقي", "Genuine capability demo")}</h2>
          <p>
            {tr(
              "هذا دليل تنقل فقط؛ لا يغير نتائج الذكاء الاصطناعي. إذا فشل التعرف، اشرح الفشل بوضوح.",
              "Navigation guidance only; AI results are unchanged. Explain any recognition failure openly.",
            )}
          </p>
          <ol>
            <li>
              <a className="feature-tool-link" href="#home">
                {tr("الرئيسية: المشكلة والحل", "Home: problem and approach")}
              </a>
            </li>
            <li>
              <a className="feature-tool-link" href="#translator">
                {tr(
                  "المترجم: اختر العربية وابدأ الكاميرا",
                  "Translator: select ArSL and start camera",
                )}
              </a>
            </li>
            <li>
              {tr(
                "أدِّ حرفاً مدعوماً؛ لا توجد دقة عربية مقاسة.",
                "Attempt a supported letter; Arabic accuracy is unmeasured.",
              )}
            </li>
            <li>
              {tr(
                "اعرض التأليف؛ ميّز النص المحرر يدوياً عن التعرف.",
                "Show composition; distinguish edited text from recognition.",
              )}
            </li>
            <li>
              {tr(
                "انطق النص عند توفر صوت عربي؛ وإلا اعرضه أو انسخه.",
                "Speak if an Arabic voice is available; otherwise display or copy.",
              )}
            </li>
            <li>
              {tr(
                "اختر ASL: تجريبي، 24 حرفاً ساكناً؛ J وZ غير مدعومين.",
                "Select ASL: Experimental, 24 static letters; J/Z unsupported.",
              )}
            </li>
            <li>
              <a className="feature-tool-link" href="#radar">
                {tr("الرادار: ابدأ الميكروفون", "Radar: start microphone")}
              </a>
            </li>
            <li>
              {tr(
                "جرّب صوتاً حقيقياً مسموحاً وآمناً إن توفر؛ قد لا يُكتشف.",
                "Try a safe, authorized real sound if available; detection may fail.",
              )}
            </li>
            <li>
              {tr(
                "اشرح المعالجة المحلية؛ أوقف الأجهزة قبل اختبار إعادة التحميل دون شبكة.",
                "Explain local processing; stop devices before testing an offline reload.",
              )}
            </li>
            <li>
              <a className="feature-tool-link" href="#about">
                {tr(
                  "معلومات المسابقة والتثبيت: استخدم عرض المتصفح إن توفر",
                  "Competition facts and installation: use the browser offer if available",
                )}
              </a>
            </li>
          </ol>
          <button className="secondary" onClick={() => setActive(false)}>
            {tr("إنهاء دليل العرض", "Exit demo guide")}
          </button>
        </section>
      )}
      {information && (
        <details className="feature-entry competition-information">
          <summary>
            <strong>{tr("معلومات المسابقة", "Competition information")}</strong>
          </summary>
          <div>
            <p>
              {tr(
                "العربية: تجريبي، 37 فئة أصلية؛ الدقة غير متحققة.",
                "ArSL: Experimental, 37 original classes; accuracy unverified.",
              )}
            </p>
            <p>
              {tr(
                "ASL: تجريبي، 24 حرفاً ساكناً؛ J وZ غير مدعومين.",
                "ASL: Experimental, 24 static letters; J/Z unsupported.",
              )}
            </p>
            <p>
              {tr(
                "الكلمات العربية: غير مدربة؛ تنتظر تسجيلات حقيقية متعددة المؤدين. KSL: غير متاح.",
                "Arabic words: Not trained; waiting for genuine multi-signer recordings. KSL: Unavailable.",
              )}
            </p>
            <p>
              {tr(
                "الرادار: YAMNet محلي تجريبي، لا يغني عن الإنذارات المعتمدة.",
                "Radar: Experimental local YAMNet; cannot replace certified alarms.",
              )}
            </p>
            <p>
              {tr(
                "الكاميرا والميكروفون للمعالجة المحلية؛ النطق يعتمد على مزود المتصفح. يعمل التطبيق والنماذج المحفوظة دون شبكة مع بقاء الملفات والأذونات.",
                "Camera and microphone inference is local; speech depends on the browser provider. The shell and downloaded models work offline while files and permissions remain available.",
              )}
            </p>
            <p>
              {tr(
                "دعم لوحة المفاتيح وRTL/LTR وتقليل الحركة؛ اختبارات قارئ الشاشة والأجهزة الفعلية لم تُجرَ.",
                "Keyboard, RTL/LTR and reduced-motion support; screen-reader and physical-device testing remain untested.",
              )}
            </p>
            {!active && (
              <button className="secondary" onClick={() => setActive(true)}>
                {tr("بدء دليل العرض", "Start demo guide")}
              </button>
            )}
          </div>
        </details>
      )}
    </>
  );
}
