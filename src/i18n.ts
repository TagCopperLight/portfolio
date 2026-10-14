export type Lang = "en" | "fr";

// English lives in index.html; only French is kept here.
export const fr: Record<string, string> = {
  subtitle: "ÉLÈVE INGÉNIEUR EN INFORMATIQUE",
  "section.about": "[À PROPOS]",
  "section.projects": "[PROJETS]",
  "label.school": "ÉCOLE",
  "label.location": "LIEU",
  roadia: "Un simulateur de trafic en temps réel et éditeur de réseau routier",
  gripsou: "Un tableau de bord de finances personnelles auto-hébergé",
  aurora: "Une boîte à outils Vulkan pour visualiser des simulations et des données en direct",
  tipe: "Graph mining et arbres de décision pour prédire l'issue des parties de League of Legends",
  gravity: "Un moteur physique 2D aux forces et solveurs modulables",

  // Project pages
  "nav.back": "[← RETOUR]",
  "label.context": "CADRE",
  "label.year": "ANNÉE",
  "roadia.context": "Projet de génie logiciel, ENSSAT",
  "roadia.body":
    "Éditeur et simulateur de trafic urbain permettant de modifier un réseau routier réel importé depuis OpenStreetMap, puis de mesurer l'effet des changements sur le temps de trajet et la pollution. Réalisation notamment du design de l'interface (Figma) et d'une partie importante du moteur Rust : la gestion des intersections, où les véhicules doivent respecter priorités, cédez-le-passage et feux sans collisions. Projet mené en équipe de 5 avec un processus de génie logiciel complet : planification, tests utilisateurs et documentation.",
  "gripsou.context": "Projet personnel",
  "gripsou.body":
    "Application web open source de gestion de patrimoine qui se connecte directement aux comptes bancaires et au courtier de l'utilisateur pour agréger automatiquement comptes, transactions et investissements, et suivre la valeur réelle du portefeuille au jour le jour. Refonte complète d'un premier projet, repensée autour d'un backend Rust et d'une interface TypeScript / Vite / Tailwind CSS.",
  "aurora.context": "Projet personnel",
  "aurora.body":
    "Moteur de rendu graphique en C++ avec Vulkan, conçu comme un outil de debug universel : grâce à un protocole réseau simple, n'importe quel programme peut lui envoyer des données à visualiser en temps réel, quel que soit le langage dans lequel il est écrit. Affichage de texte net à toute échelle par champs de distance signés (MSDF), rendu instancié pour dessiner un grand nombre d'éléments en peu d'appels, et un système d'allocation de la mémoire GPU développé sur mesure.",
  "tipe.context": "TIPE, travail d'initiative personnelle encadré",
  "tipe.body":
    "Création d'un outil en Python pour analyser et visualiser des schémas de combat dans League of Legends, en utilisant du scraping de données, des arbres de décision et des techniques de graph mining.",
  "gravity.context": "Projet personnel",
  "gravity.body":
    "Un moteur de simulation physique permettant de modéliser le comportement de corps rigides soumis à différentes forces, en s'appuyant sur divers solveurs numériques.",
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
