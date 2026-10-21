export function cancelSpeech() {
  try {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  } catch {
    /* Platform speech may be unavailable after a device change. */
  }
}
export function speakArabic(
  text: string,
  onEnd: () => void,
  onError: () => void,
): boolean {
  try {
    if (!("speechSynthesis" in window) || !text.trim()) return false;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.startsWith("ar"));
    if (!voice) return false;
    cancelSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice.lang;
    utterance.voice = voice;
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") onError();
    };
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
