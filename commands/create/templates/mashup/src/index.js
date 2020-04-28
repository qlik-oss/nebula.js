/* eslint-disable */
import embed from './configure';
import connect from './connect';

async function run() {
  const app = await connect({
    url: '<URL>',
    webIntegrationId: '<Qlik web integration id>',
    appId: '<App id>',
  });

  const n = embed(app);

  (await n.selections()).mount(document.querySelector('.toolbar'));

  // n.render({});
}

run();
