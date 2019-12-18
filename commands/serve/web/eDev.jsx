import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

import { openApp, info } from './connect';
import initiateWatch from './hot';

info.then($ => {
  if (!$.enigma.appId) {
    window.location.href = `/${window.location.search}`;
  }
  initiateWatch($);
  return openApp($.enigma.appId).then(app => {
    ReactDOM.render(<App app={app} info={$} />, document.querySelector('#app'));
  });
});
