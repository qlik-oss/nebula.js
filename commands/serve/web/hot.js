import * as stardust from '@nebula.js/stardust';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as jsxRuntime from 'react/jsx-runtime';

// The modules that a visualization imports by name are the ones of this page, so there is one of each. The names are
// the ones in lib/provided-modules.js, which the visualization is built to leave out.
export const SHARED = {
  '@nebula.js/stardust': stardust,
  react: React,
  'react-dom': ReactDOM,
  'react-dom/client': ReactDOMClient,
  'react/jsx-runtime': jsxRuntime,
};

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/**
 * The source of a module that has what an other module has, so that a visualization can import it by its name.
 */
export const shimSource = (name, ns) => {
  const exported = Object.keys(ns)
    .filter((key) => key !== 'default' && IDENTIFIER.test(key))
    .map((key) => `export const ${key} = shared[${JSON.stringify(key)}];`);
  return [
    `const shared = globalThis.nebulaShared[${JSON.stringify(name)}];`,
    'export default shared.default !== undefined ? shared.default : shared;',
    ...exported,
  ].join('\n');
};

let importMapAdded = false;

// A native import map has to be there before the first import of a module that imports by a name
const addImportMap = () => {
  if (importMapAdded) {
    return;
  }
  importMapAdded = true;
  globalThis.nebulaShared = SHARED;
  const imports = {};
  Object.entries(SHARED).forEach(([name, ns]) => {
    imports[name] = URL.createObjectURL(new Blob([shimSource(name, ns)], { type: 'text/javascript' }));
  });
  const script = document.createElement('script');
  script.type = 'importmap';
  script.textContent = JSON.stringify({ imports });
  document.head.appendChild(script);
};

// the visualization is the default export of a module
const visualization = (m) => (m && typeof m === 'object' && 'default' in m ? m.default : m);

export const getModule = async (name, url) => {
  addImportMap();
  const src = url || `/pkg/${encodeURIComponent(name)}`;
  // a new url for every load, since a module that was imported is never loaded again
  const mod = await import(/* webpackIgnore: true */ `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`);
  return visualization(mod);
};

const hotListeners = {};

const lightItUp = (name) => {
  if (!hotListeners[name]) {
    return;
  }
  hotListeners[name].forEach((fn) => fn());
};

const onHotChange = (name, fn) => {
  if (!hotListeners[name]) {
    hotListeners[name] = [];
  }

  hotListeners[name].push(fn);
  if (window[name]) {
    fn();
  }
  return () => {
    // removeListener
    const idx = hotListeners[name].indexOf(fn);
    hotListeners[name].splice(idx, 1);
  };
};

window.onHotChange = onHotChange;

export default function initiateWatch(info) {
  const update = () => {
    getModule(info.supernova.name, info.supernova.url).then((mo) => {
      window[info.supernova.name] = mo;
      lightItUp(info.supernova.name);
    });
  };

  if (info.sock.port) {
    const ws = new WebSocket(`ws://localhost:${info.sock.port}`);
    ws.onmessage = () => {
      update();
    };
  }
  update();
  if (info.types) {
    const proms = info.types.map((t) =>
      getModule(t.name, t.url).then((mo) => {
        window[t.name] = mo;
      })
    );
    return Promise.all(proms);
  }
  return Promise.resolve();
}
