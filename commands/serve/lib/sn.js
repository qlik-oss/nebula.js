// Polyfill for using async/await
// the polyfill is injected here to make sure it exists
// before the snDefinition is loaded
import 'regenerator-runtime';

import def from 'snDefinition'; // eslint-disable-line

window.snDefinition = def;

let cb = () => {};
window.hotReload = fn => {
  cb = fn;
};

if (module.hot) {
  module.hot.accept('snDefinition', () => {
    window.snDefinition = def;
    cb();
  });
}
