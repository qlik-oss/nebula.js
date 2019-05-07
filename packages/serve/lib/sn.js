import def from 'snDefinition'; // eslint-disable-line

window.snDefinition = def;

let cb = () => {};
window.hotReload = (fn) => {
  cb = fn;
};

if (module.hot) {
  module.hot.accept('snDefinition', () => {
    window.snDefinition = def;
    cb();
  });
}
