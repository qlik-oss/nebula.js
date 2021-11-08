import { embed } from '@nebula.js/stardust';
import createEnigmaMock from '@nebula.js/enigma-mock';
import { info as serverInfo } from './connect';
import initiateWatch from './hot';

async function getFixture(fixturePath) {
  if (fixturePath.endsWith('.js')) {
    return import(/* webpackIgnore: true */ `/fixture/loadScript?path=${fixturePath}`).then((module) => module.default);
  }
  return fetch(`fixture/loadJson?path=${fixturePath}`).then((res) => res.json());
}

export default async ({ fixture: fixtureParam, theme, language }) => {
  const fixture = await getFixture(fixtureParam);
  console.log('fixture', fixture);
  const element = document.querySelector('#chart-container');
  const info = await serverInfo;
  const { themes = [] } = info;
  const { name } = info.supernova;

  // Used to load module to test
  initiateWatch(info);

  const config = {
    themes: themes.map((t) => ({
      key: t,
      load: async () => (await fetch(`/theme/${t}`)).json(),
    })),
    context: {
      theme,
      language,
      constraints: {},
    },
  };

  const { app } = await createEnigmaMock(fixture);
  const nebbie = embed(app, {
    ...config,
    types: [
      {
        name,
        load: (type) => Promise.resolve(window[type.name]),
      },
    ],
  });

  console.log('qId', { app, getObject: app.getObject() });
  const object = await app.getObject();
  const layout = await object.getLayout();
  const { qId } = layout.qInfo;
  console.log({ object, layout, qId });

  window.onHotChange(name, async () => {
    nebbie.render({ type: name, element, id: qId });
  });
};
