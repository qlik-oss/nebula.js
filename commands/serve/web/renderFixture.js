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
function getFixtureUrl(fixtureParam) {
  const isPath = fixtureParam.endsWith('.json');
  return isPath ? `/fixture/fromFile?path=${fixtureParam}` : `/fixture/${fixtureParam}`;
}

async function fetchFixture(fixtureParam) {
  const url = getFixtureUrl(fixtureParam);

  // TODO Handle 404
  return fetch(url).then((res) => res.json());
}

export default async ({ fixture: fixtureParam, theme, language }) => {
  const fixture = await fetchFixture(fixtureParam);
  if (!fixture.layout.qInfo.qId) {
    throw new Error('Fixture is missing "layout.qInfo.qId"');
  }
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

  window.onHotChange(name, async () => {
    nebbie.render({ type: name, element, id: fixture.layout.qInfo.qId });
  });
};
