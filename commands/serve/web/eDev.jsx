import React from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './components/App';

import { openApp, getConnectionInfo } from './connect';
import initiateWatch from './hot';

// TODO:
// Anti-pattern
// Soltuion -> react router + use effect
getConnectionInfo().then(($) => {
  if (!$.enigma.appId) {
    window.location.href = `/${window.location.search}`;
  }
  initiateWatch($);
  return openApp($.enigma.appId).then((app) => {
    ReactDOM.createRoot(document.querySelector('#app')).render(<App app={app} info={$} />);
  });
});
