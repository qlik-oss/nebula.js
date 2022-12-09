const pie = {
  component: {
    mounted(el) {
      // eslint-disable-next-line
      el.innerHTML = '<div id="pie" style="background: blue; height:100%; width:100%;">Hello pie</div>';
    },
  },
};

const bar = function (env) {
  env.translator.add({
    id: 'hello',
    locale: {
      'sv-SE': 'Hej {0}!',
    },
  });
  return {
    component: {
      mounted(el) {
        // eslint-disable-next-line
        el.innerHTML = `<div id="bar" style="font-size: 64px; background: red; height:100%; width:100%;">${env.translator.get(
          'hello',
          ['bar']
        )}</div>`;
      },
    },
  };
};

// eslint-disable-next-line
const configured = stardust.embed.createConfiguration({
  types: [
    {
      name: 'piechart',
      load: () => Promise.resolve(pie),
    },
    {
      name: 'barchart',
      load: () => Promise.resolve(bar),
    },
  ],
});
