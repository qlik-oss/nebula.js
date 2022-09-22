import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

import { openApp, getConnectionInfo } from './connect';
import initiateWatch from './hot';

getConnectionInfo().then(($) => {
  if (!$.enigma.appId) {
    window.location.href = `/${window.location.search}`;
  }
  initiateWatch($);
  return openApp($.enigma.appId).then((app) => {
    ReactDOM.render(<App app={app} info={$} />, document.querySelector('#app'));
  });
});
