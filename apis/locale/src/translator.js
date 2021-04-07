const format = (message = '', args = []) => {
  const arr = typeof args === 'string' || typeof args === 'number' ? [args] : args;

  return message.replace(/\{(\d+)\}/g, (match, number) => (typeof arr[number] !== 'undefined' ? arr[number] : match));
};

export default function translator({ initial = 'en-US', fallback = 'en-US' } = {}) {
  const dictionaries = {};
  let currentLocale = initial;

  /**
   * @class Translator
   */
  const api = /** @lends Translator# */ {
    language: (lang) => {
      if (lang) {
        currentLocale = lang;
      }
      return currentLocale;
    },
    /**
     * Registers a string in multiple locales
     * @param {object} item
     * @param {string} item.id
     * @param {object<string,string>} item.locale
     * @example
     * translator.add({
     *   id: 'company.hello_user',
     *   locale: {
     *     'en-US': 'Hello {0}',
     *     'sv-SE': 'Hej {0}'
     *   }
     * });
     * translator.get('company.hello_user', ['John']); // Hello John
     */
    add: (item) => {
      // TODO - disallow override?
      const { id, locale } = item;
      Object.keys(locale).forEach((lang) => {
        if (!dictionaries[lang]) {
          dictionaries[lang] = {};
        }
        dictionaries[lang][id] = locale[lang];
      });
    },
    /**
     * Translates a string for current locale.
     * @param {string} str - ID of the registered string.
     * @param {Array<string>=} args - Values passed down for string interpolation.
     * @returns {string} The translated string.
     */
    get(str, args) {
      let v;
      if (dictionaries[currentLocale] && typeof dictionaries[currentLocale][str] !== 'undefined') {
        v = dictionaries[currentLocale][str];
      } else if (dictionaries[fallback] && typeof dictionaries[fallback][str] !== 'undefined') {
        v = dictionaries[fallback][str];
      } else {
        v = str;
      }

      return typeof args !== 'undefined' ? format(v, args) : v;
    },
  };

  return api;
}
