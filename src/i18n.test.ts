import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyLang, fr, parseLang } from "./i18n";
import { loadLang, saveLang } from "./storage";

const FIXTURE = `
  <button data-lang-toggle>[FR]</button>
  <h2 data-i18n="section.about">[ABOUT]</h2>
  <p data-i18n="roadia">Traffic simulator and editor for real OpenStreetMap road networks. Team of 5, ENSSAT.</p>
  <p data-i18n="missing.key">Keep me</p>
`;

const text = (selector: string) => document.querySelector(selector)?.textContent;

describe("applyLang", () => {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE;
    document.documentElement.lang = "en";
  });

  it("switches translated elements, lang and toggle to French", () => {
    applyLang("fr");
    expect(text('[data-i18n="section.about"]')).toBe("[À PROPOS]");
    expect(text('[data-i18n="roadia"]')).toBe(fr.roadia);
    expect(document.documentElement.lang).toBe("fr");
    expect(text("[data-lang-toggle]")).toBe("[EN]");
  });

  it("restores the original English text exactly", () => {
    const before = [...document.querySelectorAll("[data-i18n]")].map((el) => el.textContent);
    applyLang("fr");
    applyLang("en");
    const after = [...document.querySelectorAll("[data-i18n]")].map((el) => el.textContent);
    expect(after).toEqual(before);
    expect(document.documentElement.lang).toBe("en");
    expect(text("[data-lang-toggle]")).toBe("[FR]");
  });

  it("gives the toggle a spoken name in the language it switches to", () => {
    const toggle = document.querySelector("[data-lang-toggle]")!;
    applyLang("en");
    expect(toggle.getAttribute("aria-label")).toBe("Français");
    expect(toggle.getAttribute("lang")).toBe("fr");
    applyLang("fr");
    expect(toggle.getAttribute("aria-label")).toBe("English");
    expect(toggle.getAttribute("lang")).toBe("en");
  });

  it("reveals text hidden by the early French pre-load", () => {
    document.documentElement.classList.add("lang-pending");
    applyLang("fr");
    expect(document.documentElement.classList.contains("lang-pending")).toBe(false);
  });

  it("leaves elements without a French key untouched", () => {
    applyLang("fr");
    expect(text('[data-i18n="missing.key"]')).toBe("Keep me");
  });
});

describe("parseLang", () => {
  it("accepts fr and falls back to en for anything else", () => {
    expect(parseLang("fr")).toBe("fr");
    expect(parseLang("en")).toBe("en");
    expect(parseLang("de")).toBe("en");
    expect(parseLang("")).toBe("en");
    expect(parseLang(null)).toBe("en");
  });
});

describe("storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("round-trips the language", () => {
    saveLang("fr");
    expect(loadLang()).toBe("fr");
  });

  it("falls back to English when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadLang()).toBe("en");
  });

  it("does not throw when saving is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => saveLang("fr")).not.toThrow();
  });
});

describe("fr dictionary", () => {
  it("has exactly the spec keys", () => {
    expect(Object.keys(fr).sort()).toEqual(
      [
        "subtitle",
        "section.about",
        "section.projects",
        "label.school",
        "label.location",
        "roadia",
        "gripsou",
        "aurora",
        "tipe",
        "gravity",
      ].sort(),
    );
  });
});
