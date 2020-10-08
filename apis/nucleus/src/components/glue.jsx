import React from 'react';
import ReactDOM from 'react-dom';
import Cell from './Cell';

export default function glue({ halo, element, model, initialSnOptions, onMount, initialError }) {
  const { root } = halo;
  const cellRef = React.createRef();
  const portal = ReactDOM.createPortal(
    <Cell
      ref={cellRef}
      halo={halo}
      model={model}
      initialSnOptions={initialSnOptions}
      initialError={initialError}
      onMount={onMount}
    />,
    element,
    model.id
  );

  const unmount = () => {
    root.remove(portal);
    model.removeListener('closed', unmount);
  };

  model.on('closed', unmount);

  root.add(portal);

  return [unmount, cellRef];
}
