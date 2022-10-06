/* eslint-disable */
import { AuthType } from '@qlik/sdk';
import embed from './configure';
import connect from './connect';

async function run() {
  const app = await connect({
    connectionType: '<AuthType.SOME_CONNECTION_TYPE>',
    url: '<URL>',
    appId: '<App id>',

    // you should use only one of below keys
    // based on your `connectionType`
    clientId: '<Qlik OAuth client id>',
    webIntegrationId: '<Qlik web integration id>',
  });
  console.log(123);

  const n = embed(app);

  (await n.selections()).mount(document.querySelector('.toolbar'));

  // n.render({});
}

run();
