import localeFn from '@nebula.js/locale';
import all from './translations/all.json';

export default function appLocaleFn(language) {
  const l = localeFn({
    initial: language,
  });

  Object.keys(all).forEach(key => {
    l.translator.add(all[key]);
  });

  return {
    translator: l.translator,
  };
}
