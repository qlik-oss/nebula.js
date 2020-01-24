import * as supernova from '@nebula.js/supernova';

import { requireFrom } from 'd3-require';

const getModule = name => {
  const r = requireFrom(async n => `/pkg/${encodeURIComponent(n)}`);
  const a = r.alias({
    '@nebula.js/supernova': supernova,
  });
  return a(name);
};

const getRemoteModule = url => requireFrom(() => url)();

const hotListeners = {};

const lightItUp = name => {
  if (!hotListeners[name]) {
    return;
  }
  hotListeners[name].forEach(fn => fn());
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
    (info.supernova.url ? getRemoteModule(info.supernova.url) : getModule(info.supernova.name)).then(mo => {
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
}
