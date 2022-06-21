import React from 'react';
import { createRoot } from 'react-dom/client';

import Hello from './Hello';

export function render(element, props) {
  const root = createRoot(element);
  root.render(<Hello layout={props.layout} />);
  return root;
}

export function teardown(root) {
  root.unmount();
}
