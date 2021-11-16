import { embed } from '@nebula.js/stardust';
import EnigmaMocker from '@nebula.js/enigma-mocker';
import { info as serverInfo } from './connect';
import initiateWatch from './hot';

async function getFixture(fixturePath) {
  if (!/.+\.js$/i.test(fixturePath)) {
    throw new Error('Invalid file type of fixture. Specify a javascript file with extension ".js".');
  }
  return import(/* webpackIgnore: true */ `/fixture/loadScript?path=${fixturePath}`).then((module) => module.default);
}

export default async ({ fixture: fixtureParam, theme, language }) => {
  const fixture = await getFixture(fixtureParam);
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

  const app = await EnigmaMocker.fromGenericObjects(fixture);
  const nebbie = embed(app, {
    ...config,
    types: [
      {
        name,
        load: (type) => Promise.resolve(window[type.name]),
      },
    ],
  });

  const object = await app.getObject();
  const layout = await object.getLayout();
  const { qId } = layout.qInfo;

  window.onHotChange(name, async () => {
    nebbie.render({ type: name, element, id: qId });
  });
};
