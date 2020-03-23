/* eslint-disable */
import nucleus from './configure';
import connect from './connect';

async function run() {
  const app = await connect({
    url: '<URL>',
    webIntegrationId: '<Qlik web integration id>',
    appId: '<App id>',
  });

  const n = nucleus(app);

  (await n.selections()).mount(document.querySelector('.toolbar'));

  // n.render({});
}

run();
