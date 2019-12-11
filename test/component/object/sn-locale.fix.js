function sn(env) {
  env.translator.add({
    id: 'hello',
    locale: {
      'sv-SE': 'Hej {0}!',
    },
  });
  return {
    component: {
      mounted(element) {
        element.textContent = `${env.translator.get('hello', ['motor'])}`; // eslint-disable-line no-param-reassign
      },
    },
  };
}

export default function fixture() {
  return {
    type: 'sn-locale',
    sn,
    snConfig: {
      context: {
        permissions: ['passive', 'interact'],
      },
    },
  };
}
