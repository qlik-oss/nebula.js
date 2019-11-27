import localeFn from '@nebula.js/locale';
import en from './translations/en-US';

export default function appLocaleFn({ language }) {
  const l = localeFn({
    initial: language,
  });

  Object.keys(en).forEach(id => {
    l.translator.add({
      id,
      locale: {
        'en-US': en[id],
      },
    });
  });

  return {
    translator: l.translator,
  };
}
