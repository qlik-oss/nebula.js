import * as stardust from '@nebula.js/stardust';

import { requireFrom } from 'd3-require';

export const getModule = (name, url) => {
  const localResolve = (n) => `/pkg/${encodeURIComponent(n)}`;
  const remoteResolve = (n) => n;
  const resolve = url ? remoteResolve : localResolve;
  const r = requireFrom(async (n) => resolve(n));
  const a = r.alias({
    '@nebula.js/stardust': stardust,
  });
  return a(url || name);
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
