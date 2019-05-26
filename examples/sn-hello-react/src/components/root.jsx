import ReactDOM from 'react-dom';
import React from 'react';

import Hello from './Hello';

export function render(element, props) {
  ReactDOM.render(<Hello {...props} />, element);
}

export function teardown(element) {
  ReactDOM.unmountComponentAtNode(element);
}
