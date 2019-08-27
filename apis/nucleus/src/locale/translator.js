const DEFAULT_LANGUAGE = 'en-US';

const format = (message = '', args = []) => {
  const arr = typeof args === 'string' || typeof args === 'number' ? [args] : args;

  return message.replace(/\{(\d+)\}/g, (match, number) => (typeof arr[number] !== 'undefined' ? arr[number] : match));
};

const getLongLanguageCode = (lang, list) => {
  const code =
    list.filter(item => item.long.toLowerCase() === lang.toLowerCase())[0] ||
    list.filter(item => item.short.toLowerCase() === lang.toLowerCase())[0];

  if (!code) {
    console.warn(`Language '${lang}' not supported, falling back to ${DEFAULT_LANGUAGE}`);
    return DEFAULT_LANGUAGE;
  }
  return code.long;
};

export default function translator() {
  const dictionaries = {};
  const languageList = [];

  let currentLocale = null;

  const api = {
    locale: () => currentLocale,
    append(data, loc) {
      const lang = getLongLanguageCode(loc || currentLocale, languageList);
      if (!dictionaries[lang]) {
        dictionaries[lang] = data;
      } else {
        Object.assign(dictionaries[lang], data);
      }
    },
    get(str, args) {
      const v = typeof dictionaries[currentLocale][str] !== 'undefined' ? dictionaries[currentLocale][str] : str;
      return typeof args !== 'undefined' ? format(v, args) : v;
    },
  };

  return {
    setLanguage: code => {
      currentLocale = code;
      // TODO - emit change?
    },
    addLanguage: (descr, data) => {
      languageList.push(descr);
      api.append(data, descr.long);
    },
    getLongCode: lang => getLongLanguageCode(lang, languageList),
    api,
  };
}
