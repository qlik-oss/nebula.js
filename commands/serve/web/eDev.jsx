import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/App';

import { openApp, info } from './connect';
import initiateWatch from './hot';

info.then(($) => {
  if (!$.enigma.appId) {
    window.location.href = `/${window.location.search}`;
  }
  initiateWatch($);
  return openApp($.enigma.appId).then((app) => {
    const container = document.querySelector('#app');
    const root = createRoot(container);
    root.render(<App app={app} info={$} />);
  });
});
