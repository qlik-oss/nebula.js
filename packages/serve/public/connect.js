/* global ENIGMA_HOST, ENIGMA_PORT */

import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/3.2.json';
import SenseUtilities from 'enigma.js/sense-utilities';

const defaultConfig = {
  host: ENIGMA_HOST || window.location.hostname || 'localhost',
  port: ENIGMA_PORT,
  secure: false,
};

let connection;
const connect = () => {
  if (!connection) {
    connection = enigma.create({
      schema: qixSchema,
      url: SenseUtilities.buildUrl(defaultConfig),
    }).open();
  }

  return connection;
};

const openApp = cfg => enigma.create({
  schema: qixSchema,
  url: SenseUtilities.buildUrl({
    ...defaultConfig,
    ...cfg,
  }),
}).open().then(global => global.openDoc(cfg.appId));

const openDemoApp = () => enigma.create({
  schema: qixSchema,
  url: SenseUtilities.buildUrl({
    ...defaultConfig,
    appId: 'demo',
  }),
}).open().then(qix => qix.createSessionApp()).then(app => app.setScript(`
Characters:
Load Chr(RecNo()+Ord('A')-1) as Alpha, RecNo() as Num autogenerate 26;
  
ASCII:
Load 
  if(RecNo()>=65 and RecNo()<=90,RecNo()-64) as Num,
  Chr(RecNo()) as AsciiAlpha, 
  RecNo() as AsciiNum
autogenerate 85
  Where (RecNo()>=65 and RecNo()<=126) or RecNo()>=160;
`).then(() => app.doReload().then(() => app)));

export {
  connect,
  openApp,
  openDemoApp,
};
