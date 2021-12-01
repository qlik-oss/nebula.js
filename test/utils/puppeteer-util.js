/* eslint-disable no-console */

async function consoleEvent(msg) {
  for (let i = 0; i < msg.args().length; ++i) {
    console.log(`console ${msg.text()}`);
  }
}

function pageerrorEvent(e) {
  console.error('Web: ', e.message);
}

module.exports = {
  addListeners(page) {
    page.on('console', consoleEvent);
    page.on('pageerror', pageerrorEvent);
  },
  removeListeners(page) {
    page.removeListener('console', consoleEvent);
    page.removeListener('pageerror', pageerrorEvent);
  },
};
