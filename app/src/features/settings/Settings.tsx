import { useEffect, useState } from "react";
import type { Preferences } from "../../app/preferences";
import type { Strings } from "../../localization/strings";
import { useDeviceStatus, type DevicePhase } from "../../services/media/status";
import { Icon } from "../../components/Icon";
import { PageHeading } from "../../components/PageHeading";
type Permission = "checking" | "granted" | "denied" | "prompt" | "unavailable";
function usePermission(name: "camera" | "microphone") {
  const [state, setState] = useState<Permission>("checking");
  useEffect(() => {
    let disposed = false,
      permission: PermissionStatus | undefined;
    const update = () => {
      if (!disposed && permission) setState(permission.state);
    };
    if (!navigator.permissions?.query) {
      setState("unavailable");
      return;
    }
    void navigator.permissions
      .query({ name: name as PermissionName })
      .then((value) => {
        if (disposed) return;
        permission = value;
        update();
        permission.addEventListener("change", update);
      })
      .catch(() => {
        if (!disposed) setState("unavailable");
      });
    return () => {
      disposed = true;
      permission?.removeEventListener("change", update);
    };
  }, [name]);
  return state;
}
export default function Settings({
  t,
  lang,
  onLanguage,
  preferences,
  onPreferences,
}: {
  t: Strings;
  lang: "ar" | "en";
  onLanguage: (lang: "ar" | "en") => void;
  preferences: Preferences;
  onPreferences: (value: Preferences) => void;
}) {
  const devices = useDeviceStatus(),
    cameraPermission = usePermission("camera"),
    microphonePermission = usePermission("microphone");
  const phaseText: Record<DevicePhase, string> = {
    idle: t.deviceInactive,
    loading: t.deviceLoading,
    active: t.deviceActive,
    error: t.deviceError,
    unsupported: t.deviceUnsupported,
  };
  const permissionText: Record<Permission, string> = {
    checking: t.permissionChecking,
    granted: t.permissionGranted,
    denied: t.permissionDenied,
    prompt: t.permissionPrompt,
    unavailable: t.permissionUnavailable,
  };
  return (
    <>
      <PageHeading
        eyebrow={t.settings}
        title={t.settingsTitle}
        description={t.settingsIntro}
      />
      <div className="settings-layout">
        <div>
          <section className="settings-section">
            <h2>
              <Icon name="globe" />
              {t.languageLabel}
            </h2>
            <p className="muted">{t.languageHelp}</p>
            <div
              className="language-options"
              role="group"
              aria-label={t.languageLabel}
            >
              <button
                lang="ar"
                aria-pressed={lang === "ar"}
                onClick={() => onLanguage("ar")}
              >
                العربية <span>ع</span>
              </button>
              <button
                lang="en"
                aria-pressed={lang === "en"}
                onClick={() => onLanguage("en")}
              >
                English <span>En</span>
              </button>
            </div>
          </section>
          <section className="settings-section">
            <h2>
              <Icon name="type" />
              {t.accessibilityTitle}
            </h2>
            <div className="setting-row">
              <div>
                <label htmlFor="motion">{t.motionLabel}</label>
                <p id="motion-help">{t.motionHelp}</p>
              </div>
              <select
                id="motion"
                value={preferences.motion}
                aria-describedby="motion-help"
                onChange={(e) =>
                  onPreferences({
                    ...preferences,
                    motion: e.target.value as Preferences["motion"],
                  })
                }
              >
                <option value="system">{t.motionSystem}</option>
                <option value="reduce">{t.motionReduced}</option>
              </select>
            </div>
            <div className="setting-row">
              <label htmlFor="text-size">{t.textSizeLabel}</label>
              <select
                id="text-size"
                value={preferences.textSize}
                onChange={(e) =>
                  onPreferences({
                    ...preferences,
                    textSize: e.target.value as Preferences["textSize"],
                  })
                }
              >
                <option value="standard">{t.textStandard}</option>
                <option value="large">{t.textLarge}</option>
              </select>
            </div>
            <div className="setting-row">
              <label htmlFor="contrast">{t.contrastLabel}</label>
              <select
                id="contrast"
                value={preferences.contrast}
                onChange={(e) =>
                  onPreferences({
                    ...preferences,
                    contrast: e.target.value as Preferences["contrast"],
                  })
                }
              >
                <option value="standard">{t.contrastStandard}</option>
                <option value="high">{t.contrastHigh}</option>
              </select>
            </div>
            <p className="settings-saved">
              <Icon name="check" />
              {t.preferencesSaved}
            </p>
          </section>
        </div>
        <div>
          <section className="settings-section">
            <h2>
              <Icon name="camera" />
              {t.devicesTitle}
            </h2>
            {(
              [
                {
                  key: "camera",
                  label: t.camera,
                  permission: cameraPermission,
                  icon: "camera",
                },
                {
                  key: "microphone",
                  label: t.microphone,
                  permission: microphonePermission,
                  icon: "mic",
                },
              ] as const
            ).map((device) => (
              <div className="device-row" key={device.key}>
                <Icon name={device.icon} />
                <div>
                  <strong>{device.label}</strong>
                  <span>
                    {t.permissionLabel}: {permissionText[device.permission]}
                  </span>
                </div>
                <span
                  className={`state-badge ${devices[device.key] === "active" ? "is-active" : ""}`}
                >
                  {phaseText[devices[device.key]]}
                </span>
              </div>
            ))}
            <p className="muted">{t.permissionsHelp}</p>
          </section>
          <section className="privacy-panel">
            <Icon name="shield" />
            <h2>{t.privacyTitle}</h2>
            <p>{t.privacyDetail}</p>
            <a className="text-link" href="#about">
              {t.settingsAbout}
              <Icon name="arrow" className="direction-arrow" />
            </a>
          </section>
        </div>
      </div>
    </>
  );
}
