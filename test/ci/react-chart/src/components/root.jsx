import { createRoot } from 'react-dom/client';

import Counter from './Counter';

export function render(element, props) {
  const root = createRoot(element);
  root.render(<Counter title={props.layout.title} />);
  return root;
}

export function teardown(root) {
  root.unmount();
}
