import { embed } from '@nebula.js/stardust';
import createEnigmaMock from '@nebula.js/enigma-mock';
import { info as serverInfo } from './connect';
import initiateWatch from './hot';

export default async (params) => {
  console.log('renderFixture()', params);

  // TODO Handle 404
  const fixture = await fetch(`/fixture/${params.fixture}`).then((res) => res.json());
  const id = fixture.layout.qInfo.qId;
  console.log('  -- fixture', fixture);

  const element = document.querySelector('#chart-container');
  const { theme, language } = params;
  const info = await serverInfo;
  const { name } = info.supernova;

  // Used to load module to test
  initiateWatch(info);

  const config = {
    themes: info.themes
      ? info.themes.map((t) => ({
          key: t,
          load: async () => (await fetch(`/theme/${t}`)).json(),
        }))
      : undefined,
    context: {
      theme,
      language,
      constraints: {},
    },
  };

  const enigmaMock = await createEnigmaMock(fixture);
  const { app } = enigmaMock;
  const nebbie = embed(app, {
    ...config,
    types: [
      {
        name,
        load: (type) => Promise.resolve(window[type.name]),
      },
    ],
  });

  window.onHotChange(name, async () => {
    nebbie.render({ type: name, element, id });
  });
};
