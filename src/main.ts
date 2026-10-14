import "./style.css";
import { applyLang, type Lang } from "./i18n";
import { loadLang, saveLang } from "./storage";

let lang: Lang = loadLang();
applyLang(lang);

document.querySelector("[data-lang-toggle]")?.addEventListener("click", () => {
  lang = lang === "en" ? "fr" : "en";
  applyLang(lang);
  saveLang(lang);
});
