import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

import {
  openApp,
  params,
  info,
} from './connect';

if (!params.app) {
  location.href = location.origin; //eslint-disable-line
}

info.then($ => openApp(params.app).then((app) => {
  ReactDOM.render(<App app={app} info={$} />, document.querySelector('#app'));
}));
