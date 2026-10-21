import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ar, en } from "../localization/strings";
import { Status } from "../accessibility/Status";
import { Icon, type IconName } from "../components/Icon";
import { usePreferences, useReducedMotion } from "./preferences";
import Home from "../features/home/Home";
import { PwaExperience } from "../pwa/PwaExperience";
import { Competition } from "./Competition";
const Translator = lazy(() => import("../features/translator/Translator"));
const Radar = lazy(() => import("../features/radar/Radar"));
const Dictionary = lazy(() => import("../features/dictionary/Dictionary"));
const Settings = lazy(() => import("../features/settings/Settings"));
const MoreFeatures = lazy(() => import("../features/more/MoreFeatures"));
const routes = [
  "home",
  "translator",
  "radar",
  "dictionary",
  "more",
  "settings",
] as const;
type Route = (typeof routes)[number] | "about";
const routeIcons: Record<(typeof routes)[number], IconName> = {
  home: "home",
  translator: "hand",
  radar: "radar",
  dictionary: "message",
  more: "info",
  settings: "settings",
};
function currentRoute(): Route {
  const hash = location.hash.slice(1);
  return [...routes, "about"].includes(hash) ? (hash as Route) : "home";
}
export default function AppShell() {
  const [route, setRoute] = useState<Route>(currentRoute),
    [lang, setLang] = useState<"ar" | "en">(() => {
      try {
        return localStorage.getItem("maeen-language") === "en" ? "en" : "ar";
      } catch {
        return "ar";
      }
    });
  const [preferences, setPreferences] = usePreferences(),
    reducedMotion = useReducedMotion(preferences.motion);
  const main = useRef<HTMLElement>(null),
    t = lang === "ar" ? ar : en;
  useEffect(() => {
    const change = () => setRoute(currentRoute());
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = `${t[route]} | مُعِين MAEEN`;
    try {
      localStorage.setItem("maeen-language", lang);
    } catch {}
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [lang, route, t]);
  return (
    <div className="app-shell">
      <a
        className="skip"
        href="#content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        {t.skip}
      </a>
      <aside className="navigation-rail">
        <a className="brand" href="#home">
          <span className="brand-symbol" aria-hidden="true">
            مُ
          </span>
          <span>
            مُعِين<small>MAEEN</small>
          </span>
        </a>
        <p className="rail-label">{t.workspaceLabel}</p>
        <nav aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
          {routes.map((r) => (
            <a
              key={r}
              href={`#${r}`}
              aria-current={route === r ? "page" : undefined}
            >
              <Icon name={routeIcons[r]} />
              <span>{t[r]}</span>
            </a>
          ))}
        </nav>
        <div className="rail-bottom">
          <span className="rail-privacy">
            <Icon name="shield" />
            {t.sessionLocal}
          </span>
          <button
            className="language"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            lang={lang === "ar" ? "en" : "ar"}
          >
            <Icon name="globe" />
            {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </aside>
      <div className="app-content">
        <header className="topbar">
          <span className="breadcrumb">
            {route === "home" ? (
              <strong>{t.workspaceLabel}</strong>
            ) : (
              <>
                {t.home}
                <span aria-hidden="true">/</span>
                <strong>{t[route]}</strong>
              </>
            )}
          </span>
          <a href="#settings" className="privacy-shortcut">
            <Icon name="shield" />
            <span>{t.privacy}</span>
          </a>
        </header>
        <main id="content" ref={main} tabIndex={-1} key={`${route}-${lang}`}>
          {route === "home" ? (
            <Home t={t} />
          ) : route === "about" ? (
            <>
              <header className="page-heading">
                <div>
                  <span className="eyebrow">{t.about}</span>
                  <h1>{t.aboutTitle}</h1>
                  <p>{t.aboutInfo}</p>
                </div>
              </header>
              <div className="about-grid">
                {[
                  [t.available, t.availableText],
                  [t.pending, t.pendingText],
                  [t.privacy, t.privacyDetail],
                  [t.offline, t.offlineText],
                ].map(([title, body]) => (
                  <section className="panel" key={title}>
                    <h2>{title}</h2>
                    <p>{body}</p>
                  </section>
                ))}
              </div>
            </>
          ) : (
            <Suspense fallback={<Status text={t.loading} />}>
              {route === "translator" ? (
                <Translator t={t} />
              ) : route === "radar" ? (
                <Radar t={t} reducedMotion={reducedMotion} />
              ) : route === "dictionary" ? (
                <Dictionary t={t} lang={lang} />
              ) : route === "more" ? (
                <MoreFeatures t={t} lang={lang} />
              ) : (
                <Settings
                  t={t}
                  lang={lang}
                  onLanguage={setLang}
                  preferences={preferences}
                  onPreferences={setPreferences}
                />
              )}
            </Suspense>
          )}
        </main>
        <div className="competition-area">
          <Competition arabic={lang === "ar"} information={route === "about" || route === "more"} />
        </div>
        <PwaExperience arabic={lang === "ar"} />
        <footer>
          <span className="brand-text">
            مُعِين <small>MAEEN</small>
          </span>
          <span>{t.footer}</span>
          <a href="#about">{t.about}</a>
        </footer>
      </div>
    </div>
  );
}
