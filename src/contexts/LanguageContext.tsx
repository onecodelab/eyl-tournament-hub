import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { exactAmharicTranslations, languages, type LanguageCode, wordAmharicTranslations } from "@/lib/translations";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  toggleLanguage: () => void;
  t: (value: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
const STORAGE_KEY = "eyl_language";
const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const translatableAttributes = ["placeholder", "title", "aria-label", "alt"];
const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH", "TEXTAREA"]);

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isProbablyUserContent(value: string) {
  const trimmed = value.trim();
  return (
    !trimmed ||
    /^[-–—•|]+$/.test(trimmed) ||
    /^[\d\s:.,/+()-]+$/.test(trimmed) ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ||
    /^https?:\/\//i.test(trimmed)
  );
}

function matchCase(source: string, translated: string) {
  if (source === source.toUpperCase() && source.length > 1) return translated;
  return translated;
}

function translateWithWordFallback(value: string) {
  const normalized = normalizeText(value);
  const exact = exactAmharicTranslations[normalized];
  if (exact) {
    const leadingWhitespace = value.match(/^\s*/)?.[0] ?? "";
    const trailingWhitespace = value.match(/\s*$/)?.[0] ?? "";
    return `${leadingWhitespace}${exact}${trailingWhitespace}`;
  }

  if (!/[A-Z]/.test(value) && (value.match(/\b[A-Za-z][A-Za-z'’-]*\b/g)?.length ?? 0) > 1) {
    return value;
  }

  return value.replace(/\b[A-Za-z][A-Za-z'’-]*\b/g, (word) => {
    const translated = wordAmharicTranslations[word.toLowerCase()];
    return translated ? matchCase(word, translated) : word;
  });
}

function translateValue(value: string, language: LanguageCode) {
  if (language === "en" || isProbablyUserContent(value)) return value;
  return translateWithWordFallback(value);
}

function shouldSkipNode(node: Node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (skipTags.has(parent.tagName)) return true;
  if (parent.closest("[data-no-translate]")) return true;
  return false;
}

function applyTranslations(root: ParentNode, language: LanguageCode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
      const text = originalText.get(node as Text) ?? node.textContent ?? "";
      return isProbablyUserContent(text) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  textNodes.forEach((node) => {
    if (!originalText.has(node)) originalText.set(node, node.textContent ?? "");
    const source = originalText.get(node) ?? "";
    node.textContent = translateValue(source, language);
  });

  document.querySelectorAll<HTMLElement>("[placeholder], [title], [aria-label], img[alt]").forEach((element) => {
    if (element.closest("[data-no-translate]")) return;

    let attributeMap = originalAttributes.get(element);
    if (!attributeMap) {
      attributeMap = new Map();
      originalAttributes.set(element, attributeMap);
    }

    translatableAttributes.forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (!current || isProbablyUserContent(current)) return;
      if (!attributeMap.has(attribute)) attributeMap.set(attribute, current);
      element.setAttribute(attribute, translateValue(attributeMap.get(attribute) ?? current, language));
    });
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem(STORAGE_KEY) === "am" ? "am" : "en";
  });

  const setLanguage = useCallback((nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "am" : "en");
  }, [language, setLanguage]);

  const t = useCallback((value: string) => translateValue(value, language), [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = languages[language].dir;
    applyTranslations(document.body, language);

    const observer = new MutationObserver(() => {
      applyTranslations(document.body, language);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes,
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
