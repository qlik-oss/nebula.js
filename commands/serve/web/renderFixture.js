import { embed } from '@nebula.js/stardust';
import createEnigmaMock from '@nebula.js/enigma-mock';
import { info as serverInfo } from './connect';
import initiateWatch from './hot';

/**
 * Get url to retrieve fixture. Provide either the fixture's key or a path to the fixture file. If providing a key the fixture needs to be uploaded previously.
 *
 * @param {string} fixture Fixture key or path to fixture file
 * @returns Url to fetch fixture
 */
function getFixtureUrl(fixture) {
  const isPath = fixture.endsWith('.json');
  return isPath ? `/fixture/fromFile?path=${fixture}` : `/fixture/${fixture}`;
}

export default async (params) => {
  const url = getFixtureUrl(params.fixture);

  // TODO Handle 404
  const fixture = await fetch(url).then((res) => res.json());
  const id = fixture.layout.qInfo.qId;

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
