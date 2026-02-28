/**
 * Configuration i18next pour l'internationalisation.
 *
 * - Détection automatique de la langue du navigateur
 * - Fallback sur le français (langue d'origine)
 * - Namespaces : common, glossary, pipeline, pages, components
 *
 * @module i18n
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonFr from "./locales/fr/common.json";
import glossaryFr from "./locales/fr/glossary.json";
import pipelineFr from "./locales/fr/pipeline.json";
import pagesFr from "./locales/fr/pages.json";
import componentsFr from "./locales/fr/components.json";

import commonEn from "./locales/en/common.json";
import glossaryEn from "./locales/en/glossary.json";
import pipelineEn from "./locales/en/pipeline.json";
import pagesEn from "./locales/en/pages.json";
import componentsEn from "./locales/en/components.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common: commonFr,
        glossary: glossaryFr,
        pipeline: pipelineFr,
        pages: pagesFr,
        components: componentsFr,
      },
      en: {
        common: commonEn,
        glossary: glossaryEn,
        pipeline: pipelineEn,
        pages: pagesEn,
        components: componentsEn,
      },
    },
    fallbackLng: "fr",
    defaultNS: "common",
    ns: ["common", "glossary", "pipeline", "pages", "components"],
    interpolation: {
      escapeValue: false, // React gère déjà l'échappement
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
