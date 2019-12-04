export default function(env) {
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
