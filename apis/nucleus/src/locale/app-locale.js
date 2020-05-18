import locale from '@nebula.js/locale';
import all from '@nebula.js/locale/all.json';

export default function appLocaleFn(language) {
  const l = locale({
    initial: language,
  });

  Object.keys(all).forEach((key) => {
    l.translator.add(all[key]);
  });

  return {
    translator: l.translator,
  };
}
