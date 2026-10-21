import type { Strings } from "../../localization/strings";
import { Icon } from "../../components/Icon";
export default function Home({ t }: { t: Strings }) {
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="tiny-mark" />
            {t.homeEyebrow}
          </span>
          <h1>{t.tagline}</h1>
          <p className="hero-purpose">{t.purpose}</p>
          <p className="hero-intro">{t.intro}</p>
          <div className="hero-actions">
            <a className="button primary" href="#translator">
              <Icon name="hand" />
              {t.translator}
              <Icon name="arrow" className="direction-arrow" />
            </a>
            <a className="button secondary" href="#radar">
              <Icon name="radar" />
              {t.heroSecondary}
            </a>
          </div>
          <p className="hero-note">
            <Icon name="info" />
            {t.experimental}
          </p>
        </div>
        <div
          className="conversation-illustration"
          role="img"
          aria-label={t.handIllustration}
        >
          <div className="illustration-grid" />
          <div className="conversation-bubble bubble-first">
            <span lang="ar">مُعِين</span>
            <span className="bubble-dot" />
          </div>
          <svg
            className="hand-illustration"
            viewBox="0 0 280 320"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M97 166V81c0-20 28-20 28 0v70-102c0-21 29-21 29 0v102-88c0-20 28-20 28 0v89-58c0-20 28-20 28 0v99c0 62-36 91-77 91-35 0-54-27-66-48l-31-52c-12-20 12-34 25-18l36 45"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M101 226c-6-26 2-47 25-60M103 270l-7 33m87-32 10 32"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="m42 83-14-7m184-31 13-15M56 48l-5-16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="conversation-bubble bubble-second">
            <Icon name="message" />
            <span>{t.illustrationHello}</span>
          </div>
          <span className="illustration-caption">{t.illustrationReply}</span>
        </div>
      </section>
      <section className="benefits-strip" aria-label={t.privacy}>
        <span>
          <Icon name="shield" />
          {t.privacyShort}
        </span>
        <span>
          <Icon name="check" />
          {t.controlShort}
        </span>
      </section>
      <section className="home-tools">
        <div className="section-heading">
          <span className="eyebrow">{t.ready}</span>
          <h2>{t.benefitTitle}</h2>
          <p>{t.benefitIntro}</p>
        </div>
        <div className="feature-pair">
          <a className="feature-link" href="#translator">
            <span className="feature-icon">
              <Icon name="hand" />
            </span>
            <h3>{t.featureCamera}</h3>
            <p>{t.featureCameraText}</p>
            <span className="text-link">
              {t.translator}
              <Icon name="arrow" className="direction-arrow" />
            </span>
          </a>
          <a className="feature-link" href="#radar">
            <span className="feature-icon">
              <Icon name="radar" />
            </span>
            <h3>{t.featureRadar}</h3>
            <p>{t.featureRadarText}</p>
            <span className="text-link">
              {t.radar}
              <Icon name="arrow" className="direction-arrow" />
            </span>
          </a>
        </div>
        <a href="#dictionary" className="communication-banner">
          <span className="feature-icon">
            <Icon name="message" />
          </span>
          <span>
            <strong>{t.featureCommunication}</strong>
            <small>{t.featureCommunicationText}</small>
          </span>
          <span className="text-link">
            {t.openCommunication}
            <Icon name="arrow" className="direction-arrow" />
          </span>
        </a>
      </section>
    </>
  );
}
