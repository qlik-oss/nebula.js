import translatorFn from './translator';

import enUs from './translations/en-US';

const DEFAULT_LOCALE = 'en-US';

const SUPPORTED_LANGUAGES = [{
  info: {
    short: 'en',
    long: 'en-US',
    label: 'English',
    translatedLabel: 'Common.English',
  },
  data: enUs,
}];

export default function locale({
  language,
} = {}) {
  const translator = translatorFn();

  const api = {
    locale(lang) {
      translator.setLanguage(translator.getLongCode(lang));
      return api;
    },
    translator: () => translator.api,
  };

  SUPPORTED_LANGUAGES.forEach((d) => translator.addLanguage(d.info, d.data));

  api.locale(language || DEFAULT_LOCALE);

  return api;
}
