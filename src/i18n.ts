export type Lang = "en" | "fr";

// English lives in index.html; only French is kept here.
export const fr: Record<string, string> = {
  subtitle: "ÉLÈVE INGÉNIEUR EN INFORMATIQUE",
  "section.about": "[À PROPOS]",
  "section.projects": "[PROJETS]",
  "label.school": "ÉCOLE",
  "label.location": "LIEU",
  roadia:
    "Simulateur et éditeur de trafic sur de vrais réseaux routiers OpenStreetMap. Équipe de 5, ENSSAT.",
  gripsou:
    "Tableau de bord financier auto-hébergé qui synchronise comptes bancaires et courtiers.",
  aurora:
    "Outil Vulkan qui affiche en temps réel les données envoyées par n'importe quel programme via un petit protocole réseau.",
  tipe: "Graph mining et arbres de décision pour trouver les schémas de combat gagnants dans League of Legends.",
  gravity: "Moteur physique 2D de corps rigides en Python pur.",
};

const english = new WeakMap<Element, string>();

export function parseLang(value: string | null): Lang {
  return value === "fr" ? "fr" : "en";
}

export function applyLang(lang: Lang, root: Document = document): void {
  root.documentElement.lang = lang;

  for (const el of root.querySelectorAll("[data-i18n]")) {
    if (!english.has(el)) english.set(el, el.textContent ?? "");
    const key = el.getAttribute("data-i18n") ?? "";
    el.textContent = lang === "fr" ? (fr[key] ?? english.get(el)!) : english.get(el)!;
  }

  // The toggle names the language it switches to, spoken in that language.
  const toggle = root.querySelector("[data-lang-toggle]");
  if (toggle) {
    const next = lang === "en" ? "fr" : "en";
    toggle.textContent = next === "fr" ? "[FR]" : "[EN]";
    toggle.setAttribute("aria-label", next === "fr" ? "Français" : "English");
    toggle.setAttribute("lang", next);
  }

  // Set by the inline script in index.html for returning French visitors.
  root.documentElement.classList.remove("lang-pending");
}
