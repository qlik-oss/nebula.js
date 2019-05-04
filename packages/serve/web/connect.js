import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/3.2.json';
import SenseUtilities from 'enigma.js/sense-utilities';

const params = (() => {
  const opts = {};
  const { pathname } = window.location;
  const am = pathname.match(/\/app\/([^/?&]+)/);
  if (am) {
    opts.app = decodeURIComponent(am[1]);
  }
  window.location.search.substring(1).split('&').forEach((pair) => {
    const idx = pair.indexOf('=');
    const name = pair.substr(0, idx);
    let value = decodeURIComponent(pair.substring(idx + 1));
    if (name === 'cols') {
      value = value.split(',');
    }
    opts[name] = value;
  });

  return opts;
})();

const requestInfo = fetch('/info').then(response => response.json());

const defaultConfig = {
  host: window.location.hostname || 'localhost',
  port: 9076,
  secure: false,
};

let connection;
const connect = () => {
  if (!connection) {
    connection = requestInfo.then(info => enigma.create({
      schema: qixSchema,
      url: SenseUtilities.buildUrl({
        ...defaultConfig,
        ...info.enigma,
      }),
    }).open());
  }

  return connection;
};

const openApp = id => requestInfo.then(info => enigma.create({
  schema: qixSchema,
  url: SenseUtilities.buildUrl({
    ...defaultConfig,
    ...info.enigma,
    appId: id,
  }),
}).open().then(global => global.openDoc(id)));

export {
  connect,
  openApp,
  params,
  requestInfo as info,
};
