const SHORT_TO_FULL = {
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  nl: 'nl-NL',
  pl: 'pl-PL',
  pt: 'pt-BR',
  ru: 'ru-RU',
  sv: 'sv-SE',
  tr: 'tr-TR',
};

/**
 * Expands short language codes (e.g. "sv") to the locale keys used by the dictionaries (e.g. "sv-SE").
 * Any other value, including full locale keys, is returned unchanged.
 * @ignore
 * @param {string} lang
 * @returns {string}
 */
export default function normalizeLanguage(lang) {
  return Object.prototype.hasOwnProperty.call(SHORT_TO_FULL, lang) ? SHORT_TO_FULL[lang] : lang;
}
