import { parseLang, type Lang } from "./i18n";

const KEY = "lang";

// Storage can throw (private mode, blocked cookies): fall back silently.
export function loadLang(): Lang {
  try {
    return parseLang(localStorage.getItem(KEY));
  } catch {
    return "en";
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // The choice just won't persist across visits.
  }
}
